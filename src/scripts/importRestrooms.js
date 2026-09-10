// src/scripts/importRestrooms.js
// 목적: 행정안전부_공중화장실정보 조회서비스를 페이지네이션으로 끝까지 긁어서
//       toilets 테이블에 batch insert (기존 config/database.js의 pool 재사용)

import pool from '../config/database.js';

const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY; // Decoding 키 사용
const API_URL = 'https://apis.data.go.kr/1741000/public_restroom_info_v2/info_v2';
const ROWS_PER_PAGE = 100; // Swagger 명세상 max 100
const BATCH_SIZE = 500; // DB insert 배치 크기

async function fetchPage(pageNo) {
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: String(pageNo),
    numOfRows: String(ROWS_PER_PAGE),
    returnType: 'json',
  });
  const url = `${API_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API 요청 실패: ${res.status}`);
  const data = await res.json();

  const header = data.response?.header;
  const successCodes = ['00', '0']; // API마다 "00" 또는 "0"으로 정상 응답을 표시함
  if (header && header.resultCode !== undefined && !successCodes.includes(String(header.resultCode))) {
    throw new Error(`API 오류(${header.resultCode}): ${header.resultMsg}`);
  }

  return data.response?.body ?? {};
}

// API 응답 필드 -> DB 컬럼 매핑 (Swagger 명세 기준: MNG_NO, RSTRM_NM 등)
function mapItem(item) {
  const maleToilet = parseInt(item.MALE_TOILT_CNT || '0', 10);
  const femaleToilet = parseInt(item.FEMALE_TOILT_CNT || '0', 10);
  const maleUrinal = parseInt(item.MALE_URNL_CNT || '0', 10);

  return {
    local_code: item.OPN_ATMY_GRP_CD, // local_manager FK 제약 때문에 실제 가입 관리자가 배정되기 전까진 null
    toilet_code: item.MNG_NO,
    name: item.RSTRM_NM || '이름 미상',
    locate: item.LCTN_ROAD_NM_ADDR || item.LCTN_LOTNO_ADDR || '주소 미상',
    status: 'active', // active/suspended 두 값만 허용 — import되는 데이터는 기본 active로 시작
    urinal_count: maleUrinal,
    stall_count: maleToilet + femaleToilet,
  };
}

async function insertBatch(client, rows) {
  if (rows.length === 0) return;

  const values = [];
  const placeholders = rows
    .map((row, i) => {
      const base = i * 7;
      values.push(
        row.local_code,
        row.toilet_code,
        row.urinal_count,
        row.stall_count,
        row.name,
        row.locate,
        row.status
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
    })
    .join(', ');

  const query = `
    INSERT INTO toilets (local_code, toilet_code, urinal_count, stall_count, name, locate, status)
    VALUES ${placeholders}
    ON CONFLICT (toilet_code) DO UPDATE SET
  local_code = COALESCE(toilets.local_code, EXCLUDED.local_code),
  name = EXCLUDED.name,
  locate = EXCLUDED.locate,
  urinal_count = EXCLUDED.urinal_count,
  stall_count = EXCLUDED.stall_count,
  updated_at = now();
    -- local_code, status는 재import 시 덮어쓰지 않음 (관리자 배정/상태 값을 보존)
  `;

  await client.query(query, values);
}

async function main() {
  const client = await pool.connect();
  let pageNo = 1;
  let totalCount = null;
  let insertedTotal = 0;
  let buffer = [];

  try {
    while (true) {
      const body = await fetchPage(pageNo);
      if (totalCount === null) totalCount = body.totalCount ?? 0;

      const items = body.items?.item ?? []; // 응답 구조: body.items.item (배열)
      if (items.length === 0) break;

      buffer.push(...items.map(mapItem));

      if (buffer.length >= BATCH_SIZE) {
        await insertBatch(client, buffer.splice(0, BATCH_SIZE));
        insertedTotal += BATCH_SIZE;
        console.log(`진행: ${insertedTotal} / ${totalCount}`);
      }

      pageNo += 1;
      if ((pageNo - 1) * ROWS_PER_PAGE >= totalCount) break;

      // API 호출 과다 방지용 딜레이 (필요 없으면 제거)
      await new Promise((r) => setTimeout(r, 100));
    }

    // 남은 버퍼 처리
    if (buffer.length > 0) {
      await insertBatch(client, buffer);
      insertedTotal += buffer.length;
    }

    console.log(`완료: 총 ${insertedTotal}건 저장`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('import 실패:', err);
  process.exit(1);
});