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
    return sortedEventByPc;
  }

  analyzeEventsByYear(
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
        if (eventByPc[pcGuid] >= 100 * count * 12) {
          eventByPc[pcGuid] = 100;
        } else if (eventByPc[pcGuid] >= 80 * count * 12) {
          eventByPc[pcGuid] = 80;
        } else if (eventByPc[pcGuid] >= 60 * count * 12) {
          eventByPc[pcGuid] = 60;
        } else if (eventByPc[pcGuid] >= 40 * count * 12) {
          eventByPc[pcGuid] = 40;
        } else if (eventByPc[pcGuid] >= 20 * count * 12) {
          eventByPc[pcGuid] = 20;
        } else if (eventByPc[pcGuid] >= 10 * count * 12) {
          eventByPc[pcGuid] = 10;
        } else if (eventByPc[pcGuid] >= 5 * count * 12) {
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
    return sortedEventByPc;
  }

  analyzeFileSizeByWeek(detectFiles: any): { [pcGuid: string]: number } {
    //압축 파일 확장자
    const validExtensions = ['.zip', '.zipx', '.gz', '.z', '.egg', '.7z', '.ar', '.lz', '.lz4', '.ace', '.alz', '.lzh', '.lha', '.rar', '.bz2'];
    // PC 별로 파일 크기가 일정 양을 넘을 시 counting 할 객체
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
      // 압축 파일은 3배 곱해서 산정함
      if (validExtensions.includes("." + extension)) {
        //압축 파일인지 판별한다
        if (fileSizeByPc[pc_guid]) {
          fileSizeByPc[pc_guid] += fileSize * 3;
        } else {
          fileSizeByPc[pc_guid] = fileSize * 3;
        }
      } else {
        if (fileSizeByPc[pc_guid]) {
          fileSizeByPc[pc_guid] += fileSize;
        } else {
          fileSizeByPc[pc_guid] = fileSize;
        }
      }
    });
    Object.keys(fileSizeByPc).forEach((pcGuid, index) => {
      if(fileSizeByPc[pcGuid] >= 100000000){
        fileSizeByPc[pcGuid] = 100;
      } else if (fileSizeByPc[pcGuid] >= 80000000){
        fileSizeByPc[pcGuid] = 80;
      } else if (fileSizeByPc[pcGuid] >= 60000000){
        fileSizeByPc[pcGuid] = 60;
      } else if (fileSizeByPc[pcGuid] >= 40000000){
        fileSizeByPc[pcGuid] = 40;
      } else if (fileSizeByPc[pcGuid] >= 20000000){
        fileSizeByPc[pcGuid] = 20;
      } else if (fileSizeByPc[pcGuid] >= 10000000){
        fileSizeByPc[pcGuid] = 10;
      } else if (fileSizeByPc[pcGuid] >= 50000000){
        fileSizeByPc[pcGuid] = 5;
      } else {
        fileSizeByPc[pcGuid] = 0;
      }      
    });
    // 점수를 기준으로 내림차순 정렬
    const sortedFileSizeByPc = Object.fromEntries(
      Object.entries(fileSizeByPc).sort(([, a], [, b]) => b - a)
    );
    return sortedFileSizeByPc;
  }

  analyzeFileSizeByMonth(detectFiles: any, count: number): { [pcGuid: string]: number } {
    const validExtensions = ['.zip', '.zipx', '.gz', '.z', '.egg', '.7z', '.ar', '.lz', '.lz4', '.ace', '.alz', '.lzh', '.lha', '.rar', '.bz2'];
        // PC 별로 파일 크기가 일정 양을 넘을 시 counting 할 객체
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
      // 압축 파일은 3배 곱해서 산정함
      if (validExtensions.includes("." + extension)) {
        //압축 파일인지 판별한다
        if (fileSizeByPc[pc_guid]) {
          fileSizeByPc[pc_guid] += fileSize * 3;
        } else {
          fileSizeByPc[pc_guid] = fileSize * 3;
        }
      } else {
        if (fileSizeByPc[pc_guid]) {
          fileSizeByPc[pc_guid] += fileSize;
        } else {
          fileSizeByPc[pc_guid] = fileSize;
        }
      }
    });
    Object.keys(fileSizeByPc).forEach((pcGuid, index) => {
      if(fileSizeByPc[pcGuid] >= 20000000 * count){
        fileSizeByPc[pcGuid] = 100;
      } else if (fileSizeByPc[pcGuid] >= 16000000 * count){
        fileSizeByPc[pcGuid] = 80;
      } else if (fileSizeByPc[pcGuid] >= 14000000 * count){
        fileSizeByPc[pcGuid] = 70;
      } else if (fileSizeByPc[pcGuid] >= 10000000 * count){
        fileSizeByPc[pcGuid] = 50;
      } else if (fileSizeByPc[pcGuid] >= 80000000 * count){
        fileSizeByPc[pcGuid] = 40;
      } else if (fileSizeByPc[pcGuid] >= 60000000 * count){
        fileSizeByPc[pcGuid] = 30;
      } else if (fileSizeByPc[pcGuid] >= 40000000 * count){
        fileSizeByPc[pcGuid] = 20;
      } else if (fileSizeByPc[pcGuid] >= 20000000 * count) {
        fileSizeByPc[pcGuid] = 10;
      } else if (fileSizeByPc[pcGuid] >= 10000000 * count) {
        fileSizeByPc[pcGuid] = 5;
      } else {
        fileSizeByPc[pcGuid] = 0;
      }      
    });
    // 점수를 기준으로 내림차순 정렬
    const sortedFileSizeByPc = Object.fromEntries(
      Object.entries(fileSizeByPc).sort(([, a], [, b]) => b - a)
    );
    return sortedFileSizeByPc;
  }

  analyzePatternsDBSort(detectFiles: any, keywords : any): { [pcGuid: string]: number } {
    const patternsByPc: { [pcGuid: string]: number } = {};
    console.log('keywords',keywords);
    

    detectFiles.forEach((file: any) => {
      const { pc_guid, patterns } = file;

      const findKeywords = keywords.includes(patterns);
      console.log('findKeywords', findKeywords);
      
      console.log('data',patterns);
      // console.log('file',file);
      
      // const foundKeywords = keywords.filter(keyword => data.patt)
    });

    return patternsByPc;
  }
}

export default Average;
