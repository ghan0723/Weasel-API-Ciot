import ip from "ip";

interface IpRange {
  start: string;
  end: string;
}
 
class IpCalcService {

  parseIPRange(ipRangeStr: string): IpRange[] {
    const ipRanges = ipRangeStr.split(",").map((range) => range.trim());
    const parsedRanges = ipRanges.map((range) => {
      if (range.includes("/")) {
        // CIDR 형식
        const cidrRange = ip.cidrSubnet(range);
        return {
          start: cidrRange.networkAddress,
          end: cidrRange.broadcastAddress,
        };
      } else if (range.includes("-")) {
        // 기본 IP 범위
        const [start, end] = range.split("-").map((ip) => ip.trim());
        return { start, end };
      }
      // 단일 IP
      return { start: range, end: range };
    });
    return parsedRanges;
  }
}

export default IpCalcService;
