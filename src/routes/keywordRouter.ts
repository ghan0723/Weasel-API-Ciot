import express, { Request, Response, Router } from "express";
import IpCalcService from "../service/ipCalcService";
import UserService from "../service/userService";
import KeywordService from "../service/keywordService";
import { KeywordCounts, MergedData } from "../interface/interface";

const router: Router = express.Router();
const userService: UserService = new UserService();
const ipCalcService = new IpCalcService();
const keywordService: KeywordService = new KeywordService();

router.get("/all", (req: Request, res: Response) => {
  let select = req.query.select;
  let username = req.query.username;

  function fetchData(serviceName: string) {
    return userService.getGradeAndMngip(username).then((result) => {
      let ipRange = ipCalcService.parseIPRange(result[0].mng_ip_ranges);
      return keywordService.getKeyword(serviceName, select, ipRange);
    });
  }

  function mergeKeywordCounts(
    dataArray: Array<Array<{ pcname: string; keywordCounts: KeywordCounts }>>
  ): Array<MergedData> {
    const mergedDataMap: Map<string, KeywordCounts> = new Map();

    // dataArray의 각 배열에 대해 반복
    dataArray.forEach((data) => {
      // 배열 내의 각 객체에 대해 반복
      data.forEach((item) => {
        const pcname = item.pcname;
        const keywordCounts = item.keywordCounts;

        // pcname을 기준으로 keywordCounts를 병합
        if (mergedDataMap.has(pcname)) {
          const existingCounts = mergedDataMap.get(pcname) || {};
          Object.keys(keywordCounts).forEach((key) => {
            existingCounts[key] =
              (existingCounts[key] || 0) + keywordCounts[key];
          });
          mergedDataMap.set(pcname, existingCounts);
        } else {
          mergedDataMap.set(pcname, { ...keywordCounts });
        }
      });
    });

    // Map을 MergedData 객체의 배열로 변환
    const mergedDataArray: Array<MergedData> = Array.from(
      mergedDataMap.entries()
    ).map(([pcname, keywordCounts]) => ({
      pcname,
      keywordCounts,
      total: Object.values(keywordCounts).reduce(
        (acc, count) => acc + count,
        0
      ), // total을 추가하고 값 계산
    }));

    // 합산된 값으로 내림차순 정렬
    const sortedMergedData: Array<MergedData> = mergedDataArray.sort(
      (a, b) => (b.total || 0) - (a.total || 0)
    );

    // 상위 5개만 선택
    const top5MergedData: Array<MergedData> = sortedMergedData.slice(0, 5);

    return top5MergedData;
  }
  Promise.all([fetchData("network"), fetchData("media"), fetchData("outlook")])
    .then((dataArray) => {
      const top5MergedData: Array<MergedData> = mergeKeywordCounts(dataArray);
      res.status(200).send(top5MergedData);
    })
    .catch((err) => {
      console.error("에러 발생: ", err);
      res.status(500).send("Error fetching data");
    });
});

export = router;
