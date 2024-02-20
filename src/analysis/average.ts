class Average {
  analyzeLeaks(detectFiles:any): void {
    const leakEventsByHour = detectFiles.reduce((acc:any, file:any) => {
      const hour = new Date(file.time).getHours(); // 사건 발생 시간에서 시간대 추출
      acc[hour] = (acc[hour] || 0) + 1; // 시간대별 사건 수 집계
      return acc;
    }, {} as { [key: number]: number });

    // 시간대별 평균 유출 사건 수 계산
    const totalHours = Object.keys(leakEventsByHour).length;
    const totalEvents:any = Object.values(leakEventsByHour).reduce(
      (sum:any, count:any) => sum + count,
      0
    );
    const averageEventsPerHour = totalEvents / totalHours;

    // 이상 징후 탐지: 평균 유출 사건 수의 2배를 초과하는 시간대 식별
    const anomalyHours = Object.entries(leakEventsByHour).filter(
      ([hour, count]:any) => count > averageEventsPerHour * 2
    );

    console.log("시간대별 파일 유출 사건:", leakEventsByHour);
    console.log("평균 유출 사건 수 (시간대별):", averageEventsPerHour);
    console.log(
      "이상 징후가 발견된 시간대:",
      anomalyHours.map(([hour]) => hour)
    );
  }

  
}
export default Average;