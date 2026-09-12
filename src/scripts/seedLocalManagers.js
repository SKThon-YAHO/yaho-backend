// src/scripts/seedLocalManagers.js
// 목적: 행정안전부_공중화장실정보 API를 훑어서 존재하는 개방자치단체코드(OPN_ATMY_GRP_CD)를
//       전부 모은 다음, local_manager 테이블에 미배정 상태 row로 미리 채워넣음.
//       이걸 먼저 실행해야 toilets.local_code의 FK 제약이 통과됨.

import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;
const API_URL = 'https://apis.data.go.kr/1741000/public_restroom_info_v2/info_v2';
const ROWS_PER_PAGE = 100;

const PLACEHOLDER_PASSWORD = 'changeme_temp_password';
const PLACEHOLDER_ROLE = 'local';

async function fetchPage(pageNo) {
  const params = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    pageNo: String(pageNo),
    numOfRows: String(ROWS_PER_PAGE),
    returnType: 'json',
  });

  const res = await fetch(`${API_URL}?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`API 요청 실패: ${res.status}`);
  }

  const data = await res.json();

  const header = data.response?.header;
  const successCodes = ['00', '0'];

  if (
    header &&
    header.resultCode !== undefined &&
    !successCodes.includes(String(header.resultCode))
  ) {
    throw new Error(
      `API 오류(${header.resultCode}): ${header.resultMsg}`
    );
  }

  return data.response?.body ?? {};
}

async function collectAllCodes() {
  const codes = new Set();
  let pageNo = 1;
  let totalCount = null;

  while (true) {
    const body = await fetchPage(pageNo);

    if (totalCount === null) {
      totalCount = body.totalCount ?? 0;
    }

    const items = body.items?.item ?? [];

    if (items.length === 0) {
      break;
    }

    items.forEach((item) => {
      if (item.OPN_ATMY_GRP_CD) {
        codes.add(item.OPN_ATMY_GRP_CD);
      }
    });

    console.log(
      `코드 수집 중: ${pageNo * ROWS_PER_PAGE} / ${totalCount} ` +
      `(현재까지 ${codes.size}개 코드)`
    );

    pageNo += 1;

    if ((pageNo - 1) * ROWS_PER_PAGE >= totalCount) {
      break;
    }

    await new Promise((r) => setTimeout(r, 100));
  }

  return [...codes];
}

async function seedManagers(client, codes, hashedPassword) {
  const values = [];

  const placeholders = codes
    .map((code, i) => {
      const base = i * 3;

      values.push(
        code,
        hashedPassword,
        PLACEHOLDER_ROLE
      );

      return `($${base + 1}, $${base + 2}, $${base + 3})`;
    })
    .join(', ');

  const query = `
    INSERT INTO local_manager (
      local_code,
      password,
      role
    )
    VALUES ${placeholders}
    ON CONFLICT (local_code) DO NOTHING;
  `;

  await client.query(query, values);
}

async function main() {
  const client = await pool.connect();

  try {
    console.log('API에서 지자체 코드 수집 시작...');

    const codes = await collectAllCodes();

    console.log(`총 ${codes.length}개 고유 코드 수집 완료`);

    const hashedPassword = await bcrypt.hash(
      PLACEHOLDER_PASSWORD,
      10
    );

    const BATCH_SIZE = 500;

    for (let i = 0; i < codes.length; i += BATCH_SIZE) {
      const batch = codes.slice(i, i + BATCH_SIZE);

      await seedManagers(
        client,
        batch,
        hashedPassword
      );

      console.log(
        `local_manager 저장 진행: ` +
        `${Math.min(i + BATCH_SIZE, codes.length)} / ${codes.length}`
      );
    }

    console.log(
      '완료: local_manager에 미배정 코드 채우기 끝'
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('seed 실패:', err);
  process.exit(1);
});