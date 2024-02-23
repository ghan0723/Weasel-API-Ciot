class Average {
  analyzeLeaks(detectFiles: any): {
    leakEventsByAllHour: { [key: number]: number };
    averageEventsPerHour: number;
    anomalyHours: number[];
  } {
    // 24시간 배열을 0으로 초기화
    const leakEventsByAllHour: { [key: number]: number } = Array.from(
      { length: 24 },
      (_, i) => ({ [i]: 0 })
    ).reduce((acc: any, hourObj: any) => Object.assign(acc, hourObj), {});

    // 각 파일을 순회하면서 해당 시간의 카운트 증가
    detectFiles.forEach((file: any) => {
      const hour = new Date(file.time).getHours();
      leakEventsByAllHour[hour]++;
    });

    const leakEventsByHour = detectFiles.reduce((acc: any, file: any) => {
      const hour = new Date(file.time).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    const totalHours = Object.keys(leakEventsByHour).length;
    const totalEvents: any = Object.values(leakEventsByHour).reduce(
      (sum: any, count: any) => sum + count,
      0
    );
    const averageEventsPerHour = totalEvents / totalHours;

    const anomalyHours = Object.entries(leakEventsByHour)
      .filter(([hour, count]: any) => count > averageEventsPerHour * 2)
      .map(([hour]: any) => hour);

    return {
      leakEventsByAllHour,
      averageEventsPerHour,
      anomalyHours,
    };
  }

  analyzeEventsByWeek(detectFiles: any): { [pcGuid: string]: number } {
    // PC 별로 유출 빈도 수를 counting 할 객체
    const eventByPc: { [pcGuid: string]: number } = {};
    // 배열을 확인하면서 pc 별 빈도수를 계산한다.
    detectFiles.forEach((file: any) => {
      const { pc_guid } = file;
      // 해당 PC의 빈도수를 증가시킨다.
      if (eventByPc[pc_guid]) {
        eventByPc[pc_guid]++;
      } else {
        eventByPc[pc_guid] = 1;
      }
    });
    // 결과에 맞게 점수를 부여한다.(주간 일때는 건당 2점)
    console.log("PC 별 파일 유출 빈도:");
    Object.keys(eventByPc).forEach((pcGuid, index) => {
      if (eventByPc[pcGuid] >= 50) {
        eventByPc[pcGuid] = 100;
      } else if (eventByPc[pcGuid] >= 40) {
        eventByPc[pcGuid] = 80;
      } else if (eventByPc[pcGuid] >= 20) {
        eventByPc[pcGuid] = 40;
      } else if (eventByPc[pcGuid] >= 10) {
        eventByPc[pcGuid] = 20;
      } else if (eventByPc[pcGuid] >= 5) {
        eventByPc[pcGuid] = 10;
      } else {
        eventByPc[pcGuid] = 0;
      }
    });
    // 점수를 기준으로 내림차순 정렬
    const sortedEventByPc = Object.fromEntries(
      Object.entries(eventByPc).sort(([, a], [, b]) => b - a)
    );
    console.log("sortedEventByPc : ", sortedEventByPc);
    return sortedEventByPc;
  }

  analyzeEventsByMonth(
    detectFiles: any,
    count: number
  ): { [pcGuid: string]: number } {
    // PC 별로 유출 빈도 수를 counting 할 객체
    const eventByPc: { [pcGuid: string]: number } = {};
    // 배열을 확인하면서 pc 별 빈도수를 계산한다.
    detectFiles.forEach((file: any) => {
      const { pc_guid } = file;
      // 해당 PC의 빈도수를 증가시킨다.
      if (eventByPc[pc_guid]) {
        eventByPc[pc_guid]++;
      } else {
        eventByPc[pc_guid] = 1;
      }
    });
    // 결과에 맞게 점수를 부여한다.(주간 일때는 건당 2점)
    console.log("PC 별 파일 유출 빈도:");
    Object.keys(eventByPc).forEach((pcGuid, index) => {
      if (count > 0) {
        if (eventByPc[pcGuid] >= 100 * count) {
          eventByPc[pcGuid] = 100;
        } else if (eventByPc[pcGuid] >= 80 * count) {
          eventByPc[pcGuid] = 80;
        } else if (eventByPc[pcGuid] >= 60 * count) {
          eventByPc[pcGuid] = 60;
        } else if (eventByPc[pcGuid] >= 40 * count) {
          eventByPc[pcGuid] = 40;
        } else if (eventByPc[pcGuid] >= 20 * count) {
          eventByPc[pcGuid] = 20;
        } else if (eventByPc[pcGuid] >= 10 * count) {
          eventByPc[pcGuid] = 10;
        } else if (eventByPc[pcGuid] >= 5 * count) {
          eventByPc[pcGuid] = 5;
        } else {
          eventByPc[pcGuid] = 0;
        }
      } else {
        if (eventByPc[pcGuid] >= 100) {
          eventByPc[pcGuid] = 100;
        } else if (eventByPc[pcGuid] >= 80) {
          eventByPc[pcGuid] = 80;
        } else if (eventByPc[pcGuid] >= 60) {
          eventByPc[pcGuid] = 60;
        } else if (eventByPc[pcGuid] >= 40) {
          eventByPc[pcGuid] = 40;
        } else if (eventByPc[pcGuid] >= 20) {
          eventByPc[pcGuid] = 20;
        } else if (eventByPc[pcGuid] >= 10) {
          eventByPc[pcGuid] = 10;
        } else if (eventByPc[pcGuid] >= 5) {
          eventByPc[pcGuid] = 5;
        } else {
          eventByPc[pcGuid] = 0;
        }
      }
    });
    // 점수를 기준으로 내림차순 정렬
    const sortedEventByPc = Object.fromEntries(
      Object.entries(eventByPc).sort(([, a], [, b]) => b - a)
    );
    console.log("sortedEventByPc : ", sortedEventByPc);
    return sortedEventByPc;
  }

  analyzeFileSize(detectFiles: any): { [pcGuid: string]: number } {
    // PC 별로 파일 크기가 일정 양을 넘을 시 counting 할 객체
    const fileSizeByPc: { [pcGuid: string]: number } = {};

    // detectFiles 배열을 순회하면서 PC 별로 파일 크기의 총합을 계산
    detectFiles.forEach((file: any) => {
      const { pc_guid, file_size } = file;
      // 문자열을 숫자로 변환하여 파일 크기를 더함
      const fileSize = parseInt(file_size, 10);
      // 해당 PC의 파일 크기가 이미 저장되어 있다면 파일 크기를 더해줌
      if (fileSizeByPc[pc_guid] && fileSize > 700000) {
        fileSizeByPc[pc_guid] += 1;
      } else if (!fileSizeByPc[pc_guid] && fileSize > 700000) {
        // 해당 PC의 파일 크기가 처음 계산되는 경우, 새로운 항목을 만들어 초기화
        fileSizeByPc[pc_guid] = 1;
      }
    });
    console.log("fileSizeByPc : ", fileSizeByPc);
    // PC별 파일 크기의 총합을 반환
    return fileSizeByPc;
  }

  analyzeFileSizeByFilePath(detectFiles: any): { [pcGuid: string]: number } {
    // PC 별로 파일 크기의 총합을 저장할 객체
    const fileSizeByPc: { [pcGuid: string]: number } = {};
    // detectFiles 배열을 순회하면서 PC 별로 파일 크기의 총합을 계산
    detectFiles.forEach((file: any) => {
      const { pc_guid, file_size, org_file } = file;
      //파일 경로를 기준으로 마지막 점을 찾는다.
      const lasDotIndex = org_file.lastIndexOf(".");
      // 파일 경로에서 확장자를 추출
      const extension = org_file.substring(lasDotIndex + 1).toLowerCase(); // 확장자를 소문자로 변환하여 비교
      // 문자열을 숫자로 변환하여 파일 크기를 더함
      const fileSize = parseInt(file_size, 10);
      // 해당 PC의 파일 크기가 이미 저장되어 있다면 파일 크기를 더해줌
      if (fileSizeByPc[pc_guid] && fileSize > 500) {
        // 확장자가 zip이나 gz인 경우 파일 크기를 더함
        if (extension === "zip" || extension === "gz") {
          fileSizeByPc[pc_guid] += 1;
        }
      } else if (!fileSizeByPc[pc_guid] && fileSize > 500) {
        // 해당 PC의 파일 크기가 처음 계산되는 경우, 새로운 항목을 만들어 초기화
        // 확장자가 zip이나 gz인 경우 파일 크기를 더함
        if (extension === "zip" || extension === "gz") {
          fileSizeByPc[pc_guid] = 1; // 초기값을 1으로 설정
        }
      }
    });
    console.log("fileSizeByPc : ", fileSizeByPc);
    // PC별 파일 크기의 총합을 반환
    return fileSizeByPc;
  }

  analyzePatternsDBSort(detectFiles: any, keywords : any): { [pcGuid: string]: number } {
    const patternsByPc: { [pcGuid: string]: number } = {};
    console.log('keywords',keywords);
    

    detectFiles.forEach((file: any) => {
      const { pc_guid, patterns } = file;

      const findKeywords = keywords.includes(patterns);
      // console.log('findKeywords', findKeywords);
      
      // console.log('data',patterns);
      // console.log('file',file);
      
      // const foundKeywords = keywords.filter(keyword => data.patt)
    });

    return patternsByPc;
  }
}

export default Average;
