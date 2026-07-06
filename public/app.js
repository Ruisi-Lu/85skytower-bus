"use strict";

const API_PROXY = "api/eta";
const runtimeConfig = window.__SANDUO85_CONFIG__ || {};
const WORKER_ORIGIN = String(runtimeConfig.workerOrigin || "").replace(/\/$/, "");
const CACHE_KEY = "sanduo-85-last-snapshot";
const SETTINGS_KEY = "sanduo-85-settings";
const REFRESH_MS = 30_000;
const TABS = ["bus", "shuttle", "metro"];
const DESTINATION_LABEL = "85 大樓";
const DESTINATION_ADDRESS = "高雄市苓雅區自強三路 3 號";
const SHUTTLE_LOOKAHEAD_COUNT = 5;
const COMMUTE_LOOKAHEAD_COUNT = 6;
const METRO_LOOKAHEAD_COUNT = 6;
const METRO_RIDE_MINUTES = 11;
const METRO_SOURCE_LABEL = "高捷平常日時刻表";
const HOUYI_LABEL = "R12 後驛站";
const HOME_TO_QICHUAN_MINUTES = 5;
const HOUYI_SHUTTLE_ACCESS_MINUTES = 1;
const HOUYI_BUS_ACCESS_MINUTES = 2;

const trackedStops = [
  {
    routeId: "100",
    routeName: "100百貨幹線",
    displayRoute: "100",
    stopId: "10010095771",
    stopName: "新光三越",
    fullStopName: "新光三越(捷運三多商圈站)",
    exitLabel: "4號出口",
    exitNote: "新光三越 / SOGO 側",
    extraWalk: 0,
    destination: DESTINATION_LABEL,
    rideMinutes: 4,
    color: "dark"
  },
  {
    routeId: "100",
    routeName: "100百貨幹線",
    displayRoute: "100",
    stopId: "1001007571",
    stopName: "大遠百百貨",
    fullStopName: "大遠百百貨(捷運三多商圈站)",
    exitLabel: "1號出口",
    exitNote: "大遠百連通口",
    extraWalk: 1,
    destination: DESTINATION_LABEL,
    rideMinutes: 3,
    color: "dark"
  },
  {
    routeId: "601",
    routeName: "黃1",
    displayRoute: "黃1",
    stopId: "10060168381",
    stopName: "新光三越",
    fullStopName: "新光三越(捷運三多商圈站)",
    exitLabel: "4號出口",
    exitNote: "新光三越 / SOGO 側",
    extraWalk: 0,
    destination: DESTINATION_LABEL,
    rideMinutes: 5,
    color: "yellow"
  },
  {
    routeId: "601",
    routeName: "黃1",
    displayRoute: "黃1",
    stopId: "10060168791",
    stopName: "大遠百百貨",
    fullStopName: "大遠百百貨(捷運三多商圈站)",
    exitLabel: "1號出口",
    exitNote: "大遠百連通口",
    extraWalk: 1,
    destination: DESTINATION_LABEL,
    rideMinutes: 4,
    color: "yellow"
  },
  {
    routeId: "83",
    routeName: "83",
    displayRoute: "83",
    stopId: "100083105661",
    stopName: "捷運三多商圈站",
    fullStopName: "捷運三多商圈站(一心二路)",
    exitLabel: "3號出口",
    exitNote: "一心二路 / 中山二路東南側",
    extraWalk: 1,
    destination: DESTINATION_LABEL,
    rideMinutes: 4,
    color: "blue"
  },
  {
    routeId: "83",
    routeName: "83",
    displayRoute: "83",
    stopId: "1000837611",
    stopName: "大遠百百貨",
    fullStopName: "大遠百百貨(捷運三多商圈站)",
    exitLabel: "1號出口",
    exitNote: "大遠百連通口",
    extraWalk: 1,
    destination: DESTINATION_LABEL,
    rideMinutes: 3,
    color: "blue"
  },
  {
    routeId: "83",
    routeName: "83",
    displayRoute: "83",
    stopId: "1000839081",
    stopName: "自強三路口",
    fullStopName: "自強三路口(三多四路)",
    exitLabel: "1號出口",
    exitNote: "往 85 大樓 / 自強三路",
    extraWalk: 2,
    destination: DESTINATION_LABEL,
    rideMinutes: 2,
    color: "blue"
  },
  {
    routeId: "70",
    routeName: "70A三多幹線",
    displayRoute: "70A",
    stopId: "1000707552",
    stopName: "新光三越",
    fullStopName: "新光三越(捷運三多商圈站)",
    exitLabel: "4號出口",
    exitNote: "新光三越 / SOGO 側",
    extraWalk: 0,
    destination: "新光路口(圖書總館)",
    rideMinutes: 3,
    finalWalkMinutes: 5,
    color: "orange"
  },
  {
    routeId: "70",
    routeName: "70A三多幹線",
    displayRoute: "70A",
    stopId: "1000707582",
    stopName: "大遠百百貨",
    fullStopName: "大遠百百貨(捷運三多商圈站)",
    exitLabel: "1號出口",
    exitNote: "大遠百連通口",
    extraWalk: 1,
    destination: "新光路口(圖書總館)",
    rideMinutes: 2,
    finalWalkMinutes: 5,
    color: "orange"
  },
  {
    routeId: "701",
    routeName: "70B三多幹線",
    displayRoute: "70B",
    stopId: "1007017552",
    stopName: "新光三越",
    fullStopName: "新光三越(捷運三多商圈站)",
    exitLabel: "4號出口",
    exitNote: "新光三越 / SOGO 側",
    extraWalk: 0,
    destination: "新光路口(圖書總館)",
    rideMinutes: 3,
    finalWalkMinutes: 5,
    color: "orange"
  },
  {
    routeId: "701",
    routeName: "70B三多幹線",
    displayRoute: "70B",
    stopId: "1007017582",
    stopName: "大遠百百貨",
    fullStopName: "大遠百百貨(捷運三多商圈站)",
    exitLabel: "1號出口",
    exitNote: "大遠百連通口",
    extraWalk: 1,
    destination: "新光路口(圖書總館)",
    rideMinutes: 2,
    finalWalkMinutes: 5,
    color: "orange"
  },
  {
    routeId: "703",
    routeName: "70D三多幹線",
    displayRoute: "70D",
    stopId: "1007037552",
    stopName: "新光三越",
    fullStopName: "新光三越(捷運三多商圈站)",
    exitLabel: "4號出口",
    exitNote: "新光三越 / SOGO 側",
    extraWalk: 0,
    destination: "新光路口(圖書總館)",
    rideMinutes: 3,
    finalWalkMinutes: 5,
    color: "orange"
  },
  {
    routeId: "703",
    routeName: "70D三多幹線",
    displayRoute: "70D",
    stopId: "1007037582",
    stopName: "大遠百百貨",
    fullStopName: "大遠百百貨(捷運三多商圈站)",
    exitLabel: "1號出口",
    exitNote: "大遠百連通口",
    extraWalk: 1,
    destination: "新光路口(圖書總館)",
    rideMinutes: 2,
    finalWalkMinutes: 5,
    color: "orange"
  },
  {
    routeId: "821",
    routeName: "紅21",
    displayRoute: "紅21",
    stopId: "10082110981",
    stopName: "捷運三多商圈站",
    fullStopName: "捷運三多商圈站(中山二路)",
    exitLabel: "2號出口",
    exitNote: "中山二路往圖書總館方向",
    extraWalk: 1,
    destination: "新光路口(圖書總館)",
    rideMinutes: 2,
    finalWalkMinutes: 5,
    color: "red"
  }
];

const busReturnStops = [
  {
    busMode: "return",
    routeId: "100",
    routeName: "100百貨幹線",
    displayRoute: "100",
    stopId: "1001009092",
    stopName: "自強三路口",
    fullStopName: "自強三路口(三多四路)",
    exitLabel: "自強三路口",
    exitNote: "85 大樓門口往三多方向",
    extraWalk: 2,
    destination: "R8 三多商圈",
    destinationAddress: "",
    rideMinutes: 3,
    color: "dark"
  },
  {
    busMode: "return",
    routeId: "601",
    routeName: "黃1",
    displayRoute: "黃1",
    stopId: "100601121902",
    stopName: "自強三路口",
    fullStopName: "自強三路口(三多四路)",
    exitLabel: "自強三路口",
    exitNote: "85 大樓門口往三多方向",
    extraWalk: 2,
    destination: "R8 三多商圈",
    destinationAddress: "",
    rideMinutes: 4,
    color: "yellow"
  },
  {
    busMode: "return",
    routeId: "83",
    routeName: "83",
    displayRoute: "83",
    stopId: "100839102",
    stopName: "自強三路口",
    fullStopName: "自強三路口(三多四路)",
    exitLabel: "自強三路口",
    exitNote: "85 大樓門口往三多方向",
    extraWalk: 2,
    destination: "R8 三多商圈",
    destinationAddress: "",
    rideMinutes: 3,
    color: "blue"
  },
  {
    busMode: "return",
    routeId: "70",
    routeName: "70A三多幹線",
    displayRoute: "70A",
    stopId: "10007012811",
    stopName: "新光路口",
    fullStopName: "新光路口(圖書總館)",
    exitLabel: "新光路口",
    exitNote: "85 大樓往圖書總館側站牌",
    extraWalk: 5,
    destination: "R8 三多商圈",
    destinationAddress: "",
    rideMinutes: 4,
    color: "orange"
  },
  {
    busMode: "return",
    routeId: "701",
    routeName: "70B三多幹線",
    displayRoute: "70B",
    stopId: "10070112811",
    stopName: "新光路口",
    fullStopName: "新光路口(圖書總館)",
    exitLabel: "新光路口",
    exitNote: "85 大樓往圖書總館側站牌",
    extraWalk: 5,
    destination: "R8 三多商圈",
    destinationAddress: "",
    rideMinutes: 4,
    color: "orange"
  },
  {
    busMode: "return",
    routeId: "703",
    routeName: "70D三多幹線",
    displayRoute: "70D",
    stopId: "10070312811",
    stopName: "新光路口",
    fullStopName: "新光路口(圖書總館)",
    exitLabel: "新光路口",
    exitNote: "85 大樓往圖書總館側站牌",
    extraWalk: 5,
    destination: "R8 三多商圈",
    destinationAddress: "",
    rideMinutes: 4,
    color: "orange"
  }
];

const busStops = trackedStops
  .map((stop) => ({ ...stop, busMode: "outbound" }))
  .concat(busReturnStops);

const shuttleSchedule = [
  { depart: "07:40", mrt: "07:46", arrive: "07:52" },
  { depart: "08:00", mrt: "08:06", arrive: "08:12" },
  { depart: "08:20", mrt: "08:26", arrive: "08:32" },
  { depart: "08:40", mrt: "08:46", arrive: "08:52" },
  { depart: "09:00", mrt: "09:06", arrive: "09:12" },
  { depart: "09:20", mrt: "09:26", arrive: "09:32" },
  { depart: "09:40", mrt: "09:46", arrive: "09:52" },
  { depart: "10:00", mrt: "10:06", arrive: "10:12" },
  { depart: "10:20", mrt: "10:26", arrive: "10:32" },
  { depart: "10:40", mrt: "10:46", arrive: "10:52" },
  { depart: "11:00", mrt: "11:06", arrive: "11:12" },
  { depart: "11:20", mrt: "11:26", arrive: "11:32" },
  { depart: "11:40", mrt: "11:46", arrive: "11:52" },
  { depart: "12:00", mrt: "12:06", arrive: "12:12" },
  { depart: "12:20", mrt: "12:26", arrive: "12:32" },
  { depart: "14:00", mrt: "14:06", arrive: "14:12" },
  { depart: "14:25", mrt: "14:31", arrive: "14:37" },
  { depart: "14:50", mrt: "14:56", arrive: "15:02" },
  { depart: "15:15", mrt: "15:21", arrive: "15:27" },
  { depart: "15:40", mrt: "15:46", arrive: "15:52" },
  { depart: "16:05", mrt: "16:11", arrive: "16:17" },
  { depart: "16:30", mrt: "16:36", arrive: "16:42" },
  { depart: "16:55", mrt: "17:01", arrive: "17:07" },
  { depart: "17:20", mrt: "17:26", arrive: "17:32" },
  { depart: "17:45", mrt: "17:51", arrive: "17:57" }
];

const metroSchedules = {
  toSanduo: {
    label: "R12 後驛往 R8 三多",
    start: HOUYI_LABEL,
    end: "R8 三多商圈",
    direction: "往小港",
    times: [
      "06:08", "06:23", "06:31", "06:39", "06:47", "06:55",
      "07:00", "07:05", "07:10", "07:14", "07:18", "07:22", "07:25", "07:30", "07:34", "07:38", "07:43", "07:47", "07:51", "07:56",
      "08:00", "08:05", "08:10", "08:14", "08:18", "08:22", "08:26", "08:31", "08:36", "08:41", "08:46", "08:51", "08:56",
      "09:03", "09:09", "09:14", "09:20", "09:28", "09:36", "09:44", "09:52",
      "10:00", "10:08", "10:16", "10:24", "10:32", "10:40", "10:48", "10:56",
      "11:04", "11:12", "11:20", "11:28", "11:36", "11:44", "11:52",
      "12:00", "12:08", "12:16", "12:24", "12:32", "12:40", "12:48", "12:56",
      "13:04", "13:12", "13:20", "13:28", "13:36", "13:44", "13:52",
      "14:00", "14:08", "14:16", "14:24", "14:32", "14:40", "14:48", "14:56",
      "15:04", "15:12", "15:20", "15:28", "15:36", "15:44", "15:52",
      "16:00", "16:08", "16:16", "16:24", "16:32", "16:40", "16:48", "16:55",
      "17:00", "17:04", "17:09", "17:13", "17:18", "17:23", "17:27", "17:31", "17:36", "17:40", "17:45", "17:49", "17:54", "17:58",
      "18:03", "18:07", "18:12", "18:16", "18:21", "18:25", "18:30", "18:34", "18:39", "18:43", "18:48", "18:52", "18:58",
      "19:05", "19:12", "19:18", "19:23", "19:30", "19:37", "19:42", "19:47", "19:52",
      "20:00", "20:08", "20:16", "20:24", "20:32", "20:40", "20:48", "20:56",
      "21:04", "21:12", "21:20", "21:28", "21:36", "21:44", "21:52",
      "22:00", "22:08", "22:16", "22:24", "22:32", "22:40", "22:48", "22:55",
      "23:04", "23:12", "23:20", "23:28", "23:48",
      "24:08", "24:28"
    ]
  },
  toHouyi: {
    label: "R8 三多往 R12 後驛",
    start: "R8 三多商圈",
    end: HOUYI_LABEL,
    direction: "往岡山",
    times: [
      "05:55",
      "06:07", "06:15", "06:23", "06:31", "06:39", "06:44", "06:49", "06:54", "06:58",
      "07:02", "07:06", "07:10", "07:14", "07:18", "07:23", "07:28", "07:33", "07:38", "07:43", "07:48", "07:53", "07:57",
      "08:01", "08:05", "08:10", "08:14", "08:18", "08:23", "08:28", "08:34", "08:40", "08:47", "08:53",
      "09:00", "09:06", "09:13", "09:20", "09:24", "09:29", "09:36", "09:44", "09:52",
      "10:00", "10:08", "10:16", "10:24", "10:32", "10:40", "10:48", "10:56",
      "11:04", "11:12", "11:20", "11:28", "11:36", "11:44", "11:52",
      "12:00", "12:08", "12:16", "12:24", "12:32", "12:40", "12:48", "12:56",
      "13:04", "13:12", "13:20", "13:28", "13:36", "13:44", "13:52",
      "14:00", "14:08", "14:16", "14:24", "14:32", "14:40", "14:48", "14:56",
      "15:04", "15:12", "15:20", "15:28", "15:36", "15:44", "15:52",
      "16:00", "16:08", "16:16", "16:24", "16:32", "16:37", "16:42", "16:46", "16:51", "16:55",
      "17:00", "17:04", "17:09", "17:13", "17:18", "17:22", "17:27", "17:31", "17:36", "17:40", "17:45", "17:49", "17:54", "17:58",
      "18:03", "18:07", "18:12", "18:16", "18:21", "18:25", "18:30", "18:34", "18:39", "18:45", "18:50", "18:58",
      "19:06", "19:12", "19:18", "19:23", "19:28", "19:33", "19:38", "19:44", "19:52",
      "20:00", "20:08", "20:16", "20:24", "20:32", "20:40", "20:48", "20:56",
      "21:04", "21:12", "21:20", "21:28", "21:36", "21:44", "21:52",
      "22:00", "22:08", "22:16", "22:24", "22:32", "22:40", "22:48", "22:56",
      "23:04", "23:12", "23:32", "23:52",
      "24:16"
    ]
  }
};

const commuteBusStops = [
  {
    commuteMode: "outbound",
    routeId: "829",
    routeName: "紅29",
    displayRoute: "紅29",
    stopId: "100829143172",
    stopName: "高醫(十全路)",
    fullStopName: "高醫(十全路)",
    accessMinutes: 6,
    rideMinutes: 6,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "829",
    routeName: "紅29",
    displayRoute: "紅29",
    stopId: "10082915532",
    stopName: "三民國中",
    fullStopName: "三民國中",
    accessMinutes: 5,
    rideMinutes: 4,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "830",
    routeName: "紅30",
    displayRoute: "紅30",
    stopId: "100830143171",
    stopName: "高醫(十全路)",
    fullStopName: "高醫(十全路)",
    accessMinutes: 6,
    rideMinutes: 9,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "830",
    routeName: "紅30",
    displayRoute: "紅30",
    stopId: "10083020591",
    stopName: "高醫",
    fullStopName: "高醫(高雄醫學大學)",
    accessMinutes: 4,
    rideMinutes: 7,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "33",
    routeName: "33",
    displayRoute: "33",
    stopId: "10033143171",
    stopName: "高醫(十全路)",
    fullStopName: "高醫(十全路)",
    accessMinutes: 6,
    rideMinutes: 8,
    destination: HOUYI_LABEL,
    color: "dark"
  },
  {
    commuteMode: "outbound",
    routeId: "33",
    routeName: "33",
    displayRoute: "33",
    stopId: "1003343161",
    stopName: "高醫",
    fullStopName: "高醫(高雄醫學大學)",
    accessMinutes: 4,
    rideMinutes: 6,
    destination: HOUYI_LABEL,
    color: "dark"
  },
  {
    commuteMode: "outbound",
    routeId: "15181",
    routeName: "紅28",
    displayRoute: "紅28",
    stopId: "10015181325202",
    stopName: "高醫(十全路)",
    fullStopName: "高醫(十全路)",
    accessMinutes: 6,
    rideMinutes: 10,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "15181",
    routeName: "紅28",
    displayRoute: "紅28",
    stopId: "10015181325212",
    stopName: "三民國中",
    fullStopName: "三民國中",
    accessMinutes: 5,
    rideMinutes: 9,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "15182",
    routeName: "紅28繞",
    displayRoute: "紅28繞",
    stopId: "10015182301661",
    stopName: "高醫(十全路)",
    fullStopName: "高醫(十全路)",
    accessMinutes: 6,
    rideMinutes: 13,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "outbound",
    routeId: "15182",
    routeName: "紅28繞",
    displayRoute: "紅28繞",
    stopId: "10015182301671",
    stopName: "三民國中",
    fullStopName: "三民國中",
    accessMinutes: 5,
    rideMinutes: 12,
    destination: HOUYI_LABEL,
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "829",
    routeName: "紅29",
    displayRoute: "紅29",
    stopId: "10082920491",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 5,
    destination: "高醫",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "829",
    routeName: "紅29",
    displayRoute: "紅29",
    stopId: "10082920491",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 6,
    destination: "高醫(十全路)",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "830",
    routeName: "紅30",
    displayRoute: "紅30",
    stopId: "10083020492",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 7,
    destination: "高醫",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "830",
    routeName: "紅30",
    displayRoute: "紅30",
    stopId: "10083020492",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 8,
    destination: "高醫(十全路)",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "33",
    routeName: "33",
    displayRoute: "33",
    stopId: "1003320512",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 6,
    destination: "高醫",
    color: "dark"
  },
  {
    commuteMode: "return",
    routeId: "33",
    routeName: "33",
    displayRoute: "33",
    stopId: "1003320512",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 7,
    destination: "高醫(十全路)",
    color: "dark"
  },
  {
    commuteMode: "return",
    routeId: "26",
    routeName: "26A",
    displayRoute: "26A",
    stopId: "10026139671",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 6,
    destination: "高醫",
    color: "blue"
  },
  {
    commuteMode: "return",
    routeId: "260",
    routeName: "26B",
    displayRoute: "26B",
    stopId: "100260139671",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 6,
    destination: "高醫",
    color: "blue"
  },
  {
    commuteMode: "return",
    routeId: "15181",
    routeName: "紅28",
    displayRoute: "紅28",
    stopId: "10015181327911",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 12,
    destination: "三民國中",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "15181",
    routeName: "紅28",
    displayRoute: "紅28",
    stopId: "10015181327911",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 13,
    destination: "高醫(十全路)",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "15182",
    routeName: "紅28繞",
    displayRoute: "紅28繞",
    stopId: "10015182325962",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 16,
    destination: "三民國中",
    color: "red"
  },
  {
    commuteMode: "return",
    routeId: "15182",
    routeName: "紅28繞",
    displayRoute: "紅28繞",
    stopId: "10015182325962",
    stopName: "捷運後驛站",
    fullStopName: "捷運後驛站",
    accessMinutes: HOUYI_BUS_ACCESS_MINUTES,
    rideMinutes: 17,
    destination: "高醫(十全路)",
    color: "red"
  }
];

const initialSettings = loadSettings();

const state = {
  settings: initialSettings,
  trips: [],
  commuteTrips: [],
  lastUpdated: null,
  autoRefresh: initialSettings.autoRefresh,
  loading: false,
  timer: null,
  settingsOpen: false,
  activeTab: "bus",
  busMode: "outbound",
  commuteMode: "outbound",
  metroMode: "toSanduo"
};

const gestureState = {
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  swiping: false,
  pulling: false,
  pullReady: false,
  lockAxis: ""
};

const els = {
  appShell: document.querySelector(".app-shell"),
  autoRefreshToggle: document.querySelector("#autoRefreshToggle"),
  bestMeta: document.querySelector("#bestMeta"),
  bestRoute: document.querySelector("#bestRoute"),
  boardTitle: document.querySelector("#boardTitle"),
  busOutboundButton: document.querySelector("#busOutboundButton"),
  busPanel: document.querySelector("#busPanel"),
  busReturnButton: document.querySelector("#busReturnButton"),
  bufferMinutes: document.querySelector("#bufferMinutes"),
  bufferValue: document.querySelector("#bufferValue"),
  clock: document.querySelector("#clock"),
  commuteLabel: document.querySelector("#commuteLabel"),
  commuteOutboundButton: document.querySelector("#commuteOutboundButton"),
  commuteReturnButton: document.querySelector("#commuteReturnButton"),
  commuteStepOneLabel: document.querySelector("#commuteStepOneLabel"),
  commuteStepTwoLabel: document.querySelector("#commuteStepTwoLabel"),
  commuteStepThreeLabel: document.querySelector("#commuteStepThreeLabel"),
  decisionCopy: document.querySelector("#decisionCopy"),
  decisionLabel: document.querySelector("#decisionLabel"),
  decisionPanel: document.querySelector("#decisionPanel"),
  decisionTimeSummary: document.querySelector("#decisionTimeSummary"),
  decisionTitle: document.querySelector("#decisionTitle"),
  exitCallout: document.querySelector("#exitCallout"),
  exitKicker: document.querySelector("#exitKicker"),
  exitLabel: document.querySelector("#exitLabel"),
  exitMeta: document.querySelector("#exitMeta"),
  metroArrive: document.querySelector("#metroArrive"),
  metroClock: document.querySelector("#metroClock"),
  metroCopy: document.querySelector("#metroCopy"),
  metroCountdown: document.querySelector("#metroCountdown"),
  metroDirection: document.querySelector("#metroDirection"),
  metroFreshness: document.querySelector("#metroFreshness"),
  metroLabel: document.querySelector("#metroLabel"),
  metroList: document.querySelector("#metroList"),
  metroMeta: document.querySelector("#metroMeta"),
  metroPanel: document.querySelector("#metroPanel"),
  metroStart: document.querySelector("#metroStart"),
  metroStartLabel: document.querySelector("#metroStartLabel"),
  metroSummary: document.querySelector("#metroSummary"),
  metroToHouyiButton: document.querySelector("#metroToHouyiButton"),
  metroToSanduoButton: document.querySelector("#metroToSanduoButton"),
  nextRefresh: document.querySelector("#nextRefresh"),
  pullRefresh: document.querySelector("#pullRefresh"),
  recommendation: document.querySelector("#recommendation"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  shuttleArrive: document.querySelector("#shuttleArrive"),
  shuttleClock: document.querySelector("#shuttleClock"),
  shuttleCopy: document.querySelector("#shuttleCopy"),
  shuttleCountdown: document.querySelector("#shuttleCountdown"),
  shuttleCountdownMeta: document.querySelector("#shuttleCountdownMeta"),
  shuttleDepart: document.querySelector("#shuttleDepart"),
  shuttleFreshness: document.querySelector("#shuttleFreshness"),
  shuttleList: document.querySelector("#shuttleList"),
  shuttleMrt: document.querySelector("#shuttleMrt"),
  shuttlePanel: document.querySelector("#shuttlePanel"),
  shuttleSummary: document.querySelector("#shuttleSummary"),
  sourceStatus: document.querySelector("#sourceStatus"),
  tabButtons: document.querySelectorAll(".tab-button"),
  tripList: document.querySelector("#tripList"),
  walkMinutes: document.querySelector("#walkMinutes"),
  walkValue: document.querySelector("#walkValue")
};

init();

function init() {
  els.walkMinutes.value = state.settings.walkMinutes;
  els.bufferMinutes.value = state.settings.bufferMinutes;
  els.autoRefreshToggle.checked = state.autoRefresh;
  bindEvents();
  switchTab(tabFromHash(window.location.hash), { replace: true });
  tickClock();
  setInterval(tickClock, 1_000);
  restoreCachedSnapshot();
  refresh();
  scheduleRefresh();
  registerServiceWorker();
}

function bindEvents() {
  els.walkMinutes.addEventListener("input", updateSettingsFromControls);
  els.bufferMinutes.addEventListener("input", updateSettingsFromControls);
  els.autoRefreshToggle.addEventListener("change", toggleAutoRefresh);
  els.settingsButton.addEventListener("click", toggleSettingsPanel);
  els.busOutboundButton.addEventListener("click", () => switchBusMode("outbound"));
  els.busReturnButton.addEventListener("click", () => switchBusMode("return"));
  els.commuteOutboundButton.addEventListener("click", () => switchCommuteMode("outbound"));
  els.commuteReturnButton.addEventListener("click", () => switchCommuteMode("return"));
  els.metroToSanduoButton.addEventListener("click", () => switchMetroMode("toSanduo"));
  els.metroToHouyiButton.addEventListener("click", () => switchMetroMode("toHouyi"));
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
  bindGestures();
}

function tickClock() {
  const time = new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
  els.clock.textContent = time;
  els.shuttleClock.textContent = time;
  els.metroClock.textContent = time;
  renderCommute();
  renderMetro();
}

function switchTab(tab, options = {}) {
  const previousTab = state.activeTab;
  const activeTab = TABS.includes(tab) ? tab : "bus";
  state.activeTab = activeTab;
  els.busPanel.hidden = activeTab !== "bus";
  els.shuttlePanel.hidden = activeTab !== "shuttle";
  els.metroPanel.hidden = activeTab !== "metro";
  els.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === activeTab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (!options.replace) {
    animateActivePanel(previousTab, activeTab, options.direction);
  }

  if (!options.replace) {
    const target = activeTab === "bus"
      ? `${window.location.pathname}${window.location.search}`
      : `#${activeTab}`;
    history.replaceState(null, "", target);
  }

  if (activeTab === "metro") renderMetro();
}

function switchBusMode(mode) {
  state.busMode = mode === "return" ? "return" : "outbound";
  els.busOutboundButton.classList.toggle("active", state.busMode === "outbound");
  els.busReturnButton.classList.toggle("active", state.busMode === "return");
  els.busOutboundButton.setAttribute("aria-pressed", String(state.busMode === "outbound"));
  els.busReturnButton.setAttribute("aria-pressed", String(state.busMode === "return"));
  render();
}

function switchCommuteMode(mode) {
  state.commuteMode = mode === "return" ? "return" : "outbound";
  els.commuteOutboundButton.classList.toggle("active", state.commuteMode === "outbound");
  els.commuteReturnButton.classList.toggle("active", state.commuteMode === "return");
  els.commuteOutboundButton.setAttribute("aria-pressed", String(state.commuteMode === "outbound"));
  els.commuteReturnButton.setAttribute("aria-pressed", String(state.commuteMode === "return"));
  renderCommute();
}

function switchMetroMode(mode) {
  state.metroMode = mode === "toHouyi" ? "toHouyi" : "toSanduo";
  els.metroToSanduoButton.classList.toggle("active", state.metroMode === "toSanduo");
  els.metroToHouyiButton.classList.toggle("active", state.metroMode === "toHouyi");
  els.metroToSanduoButton.setAttribute("aria-pressed", String(state.metroMode === "toSanduo"));
  els.metroToHouyiButton.setAttribute("aria-pressed", String(state.metroMode === "toHouyi"));
  renderMetro();
}

function tabFromHash(hash) {
  const key = String(hash || "").replace("#", "");
  return TABS.includes(key) ? key : "bus";
}

function animateActivePanel(previousTab, activeTab, direction) {
  if (previousTab === activeTab) return;
  const panel = panelForTab(activeTab);
  if (!panel) return;
  const inferredDirection = direction || (TABS.indexOf(activeTab) > TABS.indexOf(previousTab) ? 1 : -1);
  panel.classList.remove("enter-from-left", "enter-from-right");
  panel.getBoundingClientRect();
  panel.classList.add(inferredDirection > 0 ? "enter-from-right" : "enter-from-left");
  window.setTimeout(() => {
    panel.classList.remove("enter-from-left", "enter-from-right");
  }, 240);
}

function panelForTab(tab) {
  if (tab === "shuttle") return els.shuttlePanel;
  if (tab === "metro") return els.metroPanel;
  return els.busPanel;
}

function updateSettingsFromControls() {
  state.settings.walkMinutes = Number(els.walkMinutes.value);
  state.settings.bufferMinutes = Number(els.bufferMinutes.value);
  persistSettings();
  renderSettings();
  render();
}

function renderSettings() {
  els.walkValue.textContent = `${state.settings.walkMinutes} 分`;
  els.bufferValue.textContent = `${state.settings.bufferMinutes} 分`;
  els.autoRefreshToggle.checked = state.autoRefresh;
}

function persistSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    ...state.settings,
    autoRefresh: state.autoRefresh
  }));
}

async function refresh(options = {}) {
  if (state.loading) return;
  state.loading = true;
  setPullRefreshState(options.manual ? "更新中" : "", { active: Boolean(options.manual) });

  try {
    const [rows, commuteRows] = await Promise.all([
      Promise.all(busStops.map(fetchStopEta)),
      Promise.all(commuteBusStops.map(fetchStopEta))
    ]);
    state.trips = rows.flat().sort(sortTrips);
    state.commuteTrips = commuteRows.flat().sort(sortTrips);
    state.lastUpdated = new Date();
    persistSnapshot();
    render();
  } catch (error) {
    console.error(error);
    renderError(error);
  } finally {
    state.loading = false;
    setPullRefreshState("下拉更新站點");
  }
}

async function fetchStopEta(stop) {
  const url = new URL(API_PROXY, apiBaseUrl());
  url.searchParams.set("stopId", stop.stopId);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`即時資料讀取失敗 (${response.status})`);
  }

  const payload = await response.json();
  const row = Array.isArray(payload.data) ? payload.data[0] : null;
  return buildTripsFromRow(stop, row);
}

function apiBaseUrl() {
  if (isNativeApp() && WORKER_ORIGIN) return `${WORKER_ORIGIN}/`;
  return window.location.href;
}

function isNativeApp() {
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (window.location.protocol === "capacitor:") return true;
  return window.location.protocol === "https:"
    && window.location.hostname === "localhost"
    && !window.location.port;
}

function buildTripsFromRow(stop, row) {
  if (!row) {
    return [{
      ...stop,
      eta: null,
      plate: "",
      status: "no-data",
      updatedAt: null,
      nextBusTime: ""
    }];
  }

  const estimates = parseEstimates(row.estimates);
  const rawEtas = estimates.length
    ? estimates.map((estimate) => ({
      eta: toNumber(estimate.estimatetime ?? estimate.etaTime),
      plate: estimate.platenumb ?? estimate.busId ?? ""
    }))
    : [{
      eta: toNumber(row.estimatetime ?? row.value),
      plate: row.platenumb ?? row.comecarid ?? ""
    }];

  const usableEtas = rawEtas.filter((item) => Number.isFinite(item.eta) && item.eta >= 0);
  if (!usableEtas.length) {
    return [{
      ...stop,
      eta: null,
      plate: "",
      status: statusFromRow(row),
      updatedAt: row.updatetime,
      nextBusTime: row.nextbustime || ""
    }];
  }

  return usableEtas
    .sort((a, b) => a.eta - b.eta)
    .slice(0, 2)
    .map((item, index) => ({
      ...stop,
      eta: item.eta,
      plate: item.plate,
      status: statusFromRow(row),
      updatedAt: row.updatetime,
      nextBusTime: row.nextbustime || "",
      estimateIndex: index
    }));
}

function parseEstimates(value) {
  if (!value || value === "[]") return [];
  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value.replaceAll("'", "\""));
  } catch {
    return [];
  }
}

function statusFromRow(row) {
  if (String(row.isconstruction) === "1" || String(row.isevent) === "1") return "detour";
  if (String(row.issuspended) === "1" || String(row.stopstatus) === "3") return "suspended";
  if (String(row.isoperationday) === "0") return "off-day";
  return "normal";
}

function sortTrips(a, b) {
  const aEta = Number.isFinite(a.eta) ? a.eta : Number.POSITIVE_INFINITY;
  const bEta = Number.isFinite(b.eta) ? b.eta : Number.POSITIVE_INFINITY;
  if (aEta !== bEta) return aEta - bEta;
  if (a.routeId !== b.routeId) return a.routeId.localeCompare(b.routeId);
  return a.stopName.localeCompare(b.stopName, "zh-Hant");
}

function render() {
  renderSettings();
  const analysis = analyzeTrips();
  renderDecision(analysis);
  renderTripList();
  renderCommute();
  renderMetro();
  renderFreshness();
}

function analyzeTrips() {
  const walkBase = state.settings.walkMinutes;
  const buffer = state.settings.bufferMinutes;

  const enriched = state.trips
    .filter((trip) => (trip.busMode || "outbound") === state.busMode)
    .map((trip) => {
      const walkTotal = walkBase + trip.extraWalk;
      const catchableEta = walkTotal + buffer;
      const leaveIn = Number.isFinite(trip.eta) ? trip.eta - catchableEta : null;
      return {
        ...trip,
        walkTotal,
        catchableEta,
        leaveIn
      };
    });

  const catchable = enriched.find((trip) => Number.isFinite(trip.eta) && trip.eta >= trip.catchableEta);
  const immediateMiss = enriched.find((trip) => Number.isFinite(trip.eta) && trip.eta >= 0 && trip.eta < trip.catchableEta);

  return {
    trips: enriched,
    best: catchable || null,
    immediateMiss: immediateMiss || null,
    hasAnyEta: enriched.some((trip) => Number.isFinite(trip.eta))
  };
}

function renderDecision(analysis) {
  const isReturn = state.busMode === "return";
  els.decisionPanel.classList.remove("ready", "hold", "miss");
  els.boardTitle.textContent = isReturn ? "回三多班次" : "可銜接班次";

  if (!analysis.hasAnyEta) {
    els.decisionPanel.classList.add("miss");
    els.decisionLabel.textContent = "暫無班次";
    els.decisionTitle.textContent = isReturn ? "先不要走" : "先留在站內";
    els.decisionTimeSummary.textContent = "沒有可用到站時間";
    els.decisionCopy.textContent = "目前沒有可用的即時到站時間。請等下一次自動更新，或改查官方 iBus+。";
    hideExitCallout();
    els.recommendation.hidden = true;
    return;
  }

  if (!analysis.best) {
    els.decisionPanel.classList.add("miss");
    els.decisionLabel.textContent = "這班太近";
    const missed = analysis.immediateMiss;
    els.decisionTitle.textContent = missed ? `${etaClockText(missed)} 抵達` : "先不要衝";
    els.decisionTimeSummary.textContent = missed ? `${missed.displayRoute} ${etaClockText(missed)} 抵達 ${missed.stopName}` : "等待下一次更新";
    els.decisionCopy.textContent = missed ? buildMissedDecisionCopy(missed, isReturn) : "有資料但沒有算出可穩定銜接的班次，等下一次更新。";
    if (missed) {
      showExitCallout(missed, isReturn ? "最近班次站牌" : "最近班次出口", "時間不夠，先不要衝");
    } else {
      hideExitCallout();
    }
    els.recommendation.hidden = true;
    return;
  }

  const best = analysis.best;
  if (best.leaveIn <= 0) {
    els.decisionPanel.classList.add("ready");
    els.decisionLabel.textContent = isReturn ? "現在出發" : "現在出站";
    els.decisionTitle.textContent = `${etaClockText(best)} 抵達`;
    els.decisionTimeSummary.textContent = `${best.displayRoute} 約 ${best.eta} 分鐘後到 ${best.stopName}，現在往 ${best.exitLabel}`;
    els.decisionCopy.textContent = buildReadyDecisionCopy(best, isReturn);
    showExitCallout(best, isReturn ? "現在往這站牌" : "現在走這裡", "可銜接");
  } else {
    els.decisionPanel.classList.add("hold");
    els.decisionLabel.textContent = isReturn ? "再等一下" : "冷氣待命";
    els.decisionTitle.textContent = `${etaClockText(best)} 抵達`;
    els.decisionTimeSummary.textContent = `${best.displayRoute} 約 ${best.eta} 分鐘後到 ${best.stopName}，${best.leaveIn} 分鐘後往 ${best.exitLabel}`;
    els.decisionCopy.textContent = buildHoldDecisionCopy(best, isReturn);
    showExitCallout(best, isReturn ? "待會往這站牌" : "待會走這裡", `約 ${best.leaveIn} 分後出發`);
  }

  els.bestRoute.textContent = best.displayRoute;
  els.bestRoute.className = `route-pill ${routeColorClass(best)}`;
  els.bestMeta.textContent = `${best.exitLabel} ${best.exitNote}，${best.stopName}上車，${tripDestinationText(best)}`;
  els.recommendation.hidden = false;
}

function buildMissedDecisionCopy(trip, isReturn) {
  if (isReturn) {
    return `${trip.displayRoute} 約 ${trip.eta} 分到 ${trip.stopName}，但從 85 走到站牌加緩衝需要 ${trip.catchableEta} 分，等下一班比較穩。`;
  }

  return `${trip.displayRoute} 約 ${trip.eta} 分到 ${trip.stopName}，最近班次要走 ${trip.exitLabel}，但走到站牌加緩衝需要 ${trip.catchableEta} 分，等下一班比較穩。`;
}

function buildReadyDecisionCopy(trip, isReturn) {
  if (isReturn) {
    return `${trip.displayRoute} 約 ${trip.eta} 分到 ${trip.stopName}，從 85 走到站牌約 ${trip.walkTotal} 分，還有 ${state.settings.bufferMinutes} 分緩衝。`;
  }

  return `${trip.displayRoute} 約 ${trip.eta} 分到 ${trip.stopName}，從 ${trip.exitLabel} 走到站牌約 ${trip.walkTotal} 分，還有 ${state.settings.bufferMinutes} 分緩衝。`;
}

function buildHoldDecisionCopy(trip, isReturn) {
  if (isReturn) {
    return `${trip.displayRoute} 約 ${trip.eta} 分到 ${trip.stopName}。照目前設定，約 ${trip.leaveIn} 分鐘後從 85 大樓出發比較剛好。`;
  }

  return `${trip.displayRoute} 約 ${trip.eta} 分到 ${trip.stopName}，要走 ${trip.exitLabel}。照目前設定，約 ${trip.leaveIn} 分鐘後離開捷運站比較剛好。`;
}

function showExitCallout(trip, kicker, status) {
  els.exitKicker.textContent = kicker;
  els.exitLabel.textContent = trip.exitLabel;
  els.exitMeta.textContent = `${trip.exitNote}，${trip.stopName}上車 · ${status}`;
  els.exitCallout.hidden = false;
}

function etaClockText(trip) {
  if (!Number.isFinite(trip.eta)) return "--:--";
  const etaDate = new Date(Date.now() + trip.eta * 60_000);
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(etaDate);
}

function hideExitCallout() {
  els.exitCallout.hidden = true;
}

function renderTripList() {
  const analysis = analyzeTrips();
  const isReturn = state.busMode === "return";
  if (!analysis.trips.length) {
    els.tripList.innerHTML = `<p class="trip-note">目前沒有資料。</p>`;
    return;
  }

  els.tripList.innerHTML = analysis.trips.map((trip) => {
    const isCatchable = Number.isFinite(trip.eta) && trip.eta >= trip.catchableEta;
    const isSoon = Number.isFinite(trip.eta) && trip.eta >= 0 && trip.eta < trip.catchableEta;
    const rowClass = isCatchable ? "catchable" : isSoon ? "soon" : "";
    const etaText = Number.isFinite(trip.eta) ? Math.max(0, trip.eta) : "--";
    const note = buildTripNote(trip, isCatchable, isSoon);
    const plate = trip.plate ? `，車號 ${escapeHtml(trip.plate)}` : "";
    const routeClass = routeColorClass(trip);
    const accessText = isReturn
      ? `從 85 走到 ${trip.exitLabel} 約 ${trip.walkTotal} 分`
      : `從 ${trip.exitLabel} 走到站牌約 ${trip.walkTotal} 分`;
    const markerLabel = isReturn ? "站牌" : "出口";

    return `
      <article class="trip-row ${rowClass}">
        <div class="trip-route ${routeClass}">${escapeHtml(trip.displayRoute)}</div>
        <div class="trip-main">
          <div class="trip-title">${escapeHtml(trip.routeName)} · ${escapeHtml(trip.stopName)}</div>
          <div class="trip-subtitle">${escapeHtml(tripDestinationText(trip))}，${escapeHtml(accessText)}${plate}</div>
          <div class="trip-exit">${markerLabel}：${escapeHtml(trip.exitLabel)} · ${escapeHtml(trip.exitNote)}</div>
          <div class="trip-note">${note}</div>
        </div>
        <div class="trip-time">
          <div class="eta">${etaText}</div>
          <div class="unit">分鐘</div>
        </div>
      </article>
    `;
  }).join("");
}

function tripDestinationText(trip) {
  const finalWalk = Number(trip.finalWalkMinutes) || 0;
  const address = trip.destinationAddress ?? DESTINATION_ADDRESS;
  const suffix = finalWalk > 0
    ? `，下車後走約 ${finalWalk} 分到 ${address}`
    : address ? `（${address}）` : "";
  return `車程約 ${trip.rideMinutes} 分到 ${trip.destination}${suffix}`;
}

function routeColorClass(trip) {
  return ["yellow", "blue", "orange", "red"].includes(trip.color) ? trip.color : "";
}

function buildTripNote(trip, isCatchable, isSoon) {
  if (!Number.isFinite(trip.eta)) return statusText(trip.status, trip.nextBusTime);
  if (isSoon) return `可能接不上，需要 ${trip.catchableEta} 分才穩。`;
  if (isCatchable && trip.leaveIn <= 0) return state.busMode === "return" ? "現在從 85 出發可銜接。" : "現在離開可銜接。";
  if (isCatchable) return state.busMode === "return" ? `建議往後驛站{trip.leaveIn} 分鐘後從 85 出發。` : `建議 ${trip.leaveIn} 分鐘後離開捷運站。`;
  return statusText(trip.status, trip.nextBusTime);
}

function statusText(status, nextBusTime) {
  if (status === "suspended") return nextBusTime ? `尚未發車，表定 ${nextBusTime}` : "尚未發車";
  if (status === "off-day") return "今日未營運";
  if (status === "detour") return "施工或活動影響停靠";
  if (status === "no-data") return "暫無即時資料";
  return "等待下一次更新";
}

function renderCommute() {
  const now = new Date();
  const analysis = analyzeCommute(now);
  const best = analysis.best;
  const isReturn = state.commuteMode === "return";

  els.commuteLabel.textContent = isReturn ? "後驛回高醫" : "往後驛站";
  els.shuttleFreshness.textContent = isReturn ? "往高醫模式" : "出門模式";
  els.shuttleSummary.textContent = isReturn ? "後驛出發比較" : "到後驛比較";
  els.commuteStepOneLabel.textContent = isReturn ? "後驛站" : "出發";
  els.commuteStepTwoLabel.textContent = "上車";
  els.commuteStepThreeLabel.textContent = "抵達";

  if (!best) {
    els.shuttleCountdown.textContent = "--:--";
    els.shuttleCountdownMeta.textContent = "目前沒有可穩定銜接的方案";
    els.shuttleDepart.textContent = isReturn ? HOUYI_LABEL : "往後驛站";
    els.shuttleMrt.textContent = "--";
    els.shuttleArrive.textContent = "--";
    els.shuttleCopy.textContent = isReturn
      ? "目前後驛接駁車與公車沒有可穩定銜接到高醫或三民國中的班次。"
      : "目前接駁車與公車都沒有可穩定銜接到後驛站的班次。";
    renderCommuteList(analysis.options, null, now);
    return;
  }

  els.shuttleCountdown.textContent = `${formatClock(best.arriveAt)} 抵達`;
  els.shuttleCountdownMeta.textContent = best.meta;
  els.shuttleDepart.textContent = best.startText;
  els.shuttleMrt.textContent = best.boardText;
  els.shuttleArrive.textContent = formatClock(best.arriveAt);
  els.shuttleCopy.textContent = best.copy;
  renderCommuteList(analysis.options, best, now);
}

function analyzeCommute(now) {
  const options = buildCommuteOptions(now).sort(sortCommuteOptions);
  const best = options.find((option) => option.catchable) || null;

  return {
    best,
    options: options.slice(0, COMMUTE_LOOKAHEAD_COUNT)
  };
}

function buildCommuteOptions(now) {
  return buildShuttleCommuteOptions(now)
    .concat(buildBusCommuteOptions(now));
}

function buildShuttleCommuteOptions(now) {
  const buffer = state.settings.bufferMinutes;
  const isReturn = state.commuteMode === "return";
  const timeKey = isReturn ? "mrtAt" : "departAt";
  const accessMinutes = isReturn ? HOUYI_SHUTTLE_ACCESS_MINUTES : HOME_TO_QICHUAN_MINUTES;
  const occurrences = findUpcomingShuttles(now, SHUTTLE_LOOKAHEAD_COUNT, timeKey);

  return occurrences.map((item) => {
    const boardAt = isReturn ? item.mrtAt : item.departAt;
    const arriveAt = isReturn ? item.arriveAt : item.mrtAt;
    const eta = minutesUntil(now, boardAt);
    const catchableEta = accessMinutes + buffer;
    const catchable = eta >= catchableEta;
    const waitAtStop = eta - accessMinutes;
    const destination = isReturn ? "高醫" : HOUYI_LABEL;
    const dayText = item.dayOffset === 0 ? "今天" : "明天";

    return {
      type: "shuttle",
      routeName: "高醫接駁",
      displayRoute: "接駁",
      stopName: isReturn ? "後驛捷運站" : "啟川大樓",
      destination,
      eta,
      catchable,
      catchableEta,
      waitAtStop,
      boardAt,
      arriveAt,
      accessMinutes,
      rideMinutes: isReturn ? 6 : 6,
      color: "yellow",
      startText: isReturn ? HOUYI_LABEL : "往後驛站",
      boardText: `${dayText} ${formatClock(boardAt)}`,
      meta: isReturn
        ? `在後驛站 ${formatClock(boardAt)} 搭接駁車`
        : `走到啟川大樓約 ${HOME_TO_QICHUAN_MINUTES} 分，${formatClock(boardAt)} 發車`,
      copy: isReturn
        ? `在後驛站搭 ${formatClock(boardAt)} 接駁車，約 ${formatClock(arriveAt)} 抵達高醫。`
        : `走到啟川大樓約 ${HOME_TO_QICHUAN_MINUTES} 分。搭 ${formatClock(boardAt)} 接駁車，約 ${formatClock(arriveAt)} 到後驛站。`
    };
  });
}

function buildBusCommuteOptions(now) {
  const buffer = state.settings.bufferMinutes;

  return state.commuteTrips
    .filter((trip) => trip.commuteMode === state.commuteMode)
    .map((trip) => {
      const eta = Number.isFinite(trip.eta) ? trip.eta : null;
      const accessMinutes = Number(trip.accessMinutes) || 0;
      const catchableEta = accessMinutes + buffer;
      const catchable = Number.isFinite(eta) && eta >= catchableEta;
      const boardAt = Number.isFinite(eta) ? addMinutes(now, eta) : null;
      const arriveAt = Number.isFinite(eta) ? addMinutes(now, eta + trip.rideMinutes) : null;
      const waitAtStop = Number.isFinite(eta) ? eta - accessMinutes : null;
      const isReturn = state.commuteMode === "return";
      const startText = isReturn ? HOUYI_LABEL : "往後驛站";
      const boardText = boardAt ? `${formatClock(boardAt)} ${trip.stopName}` : trip.stopName;
      const meta = boardAt
        ? `${trip.displayRoute} ${formatClock(boardAt)} 到 ${trip.stopName}，約 ${formatClock(arriveAt)} 到 ${trip.destination}`
        : `${trip.displayRoute} ${trip.stopName} 暫無即時到站`;

      return {
        type: "bus",
        routeName: trip.routeName,
        displayRoute: trip.displayRoute,
        stopName: trip.stopName,
        destination: trip.destination,
        eta,
        status: trip.status,
        nextBusTime: trip.nextBusTime,
        catchable,
        catchableEta,
        waitAtStop,
        boardAt,
        arriveAt,
        accessMinutes,
        rideMinutes: trip.rideMinutes,
        plate: trip.plate,
        color: trip.color,
        startText,
        boardText,
        meta,
        copy: isReturn
          ? `從後驛站走到 ${trip.stopName} 約 ${accessMinutes} 分。若接上 ${trip.displayRoute}，約 ${formatClock(arriveAt)} 抵達 ${trip.destination}。`
          : `走到 ${trip.stopName} 約 ${accessMinutes} 分。若接上 ${trip.displayRoute}，約 ${formatClock(arriveAt)} 抵達後驛站。`
      };
    });
}

function renderCommuteList(options, best, now) {
  if (!options.length) {
    els.shuttleList.innerHTML = `<p class="trip-note">目前沒有資料。</p>`;
    return;
  }

  els.shuttleList.innerHTML = options.map((option) => {
    const isBest = option === best;
    const rowClass = isBest ? "next" : !option.catchable && Number.isFinite(option.eta) ? "soon" : "";
    const routeClass = routeColorClass(option);
    const boardTime = option.boardAt ? formatClock(option.boardAt) : "--";
    const arriveTime = option.arriveAt ? formatClock(option.arriveAt) : "--";
    const countdown = commuteCountdownText(option, now);
    const plate = option.plate ? ` · ${escapeHtml(option.plate)}` : "";

    return `
      <article class="shuttle-row commute-row ${rowClass}">
        <div>
          <span>${escapeHtml(option.type === "shuttle" ? "接駁車" : option.stopName)}</span>
          <strong class="${routeClass ? `text-${routeClass}` : ""}">${escapeHtml(option.displayRoute)}${plate}</strong>
        </div>
        <div>
          <span>${escapeHtml(option.catchable ? "上車" : "時間不足")}</span>
          <strong>${escapeHtml(boardTime)}</strong>
        </div>
        <div>
          <span>${escapeHtml(option.destination)}</span>
          <strong>${escapeHtml(arriveTime)}</strong>
        </div>
        <div class="shuttle-row-countdown">${escapeHtml(countdown)}</div>
      </article>
    `;
  }).join("");
}

function commuteCountdownText(option, now) {
  if (!Number.isFinite(option.eta)) return statusText(option.status, option.nextBusTime);
  if (!option.catchable) return `差 ${Math.max(1, option.catchableEta - option.eta)} 分`;
  if (option.waitAtStop <= 0) return "現在走";
  if (option.type === "shuttle") return formatCountdown(option.boardAt.getTime() - now.getTime());
  return `${option.waitAtStop} 分後到站`;
}

function sortCommuteOptions(a, b) {
  if (a.catchable !== b.catchable) return a.catchable ? -1 : 1;
  const aTime = a.arriveAt ? a.arriveAt.getTime() : Number.POSITIVE_INFINITY;
  const bTime = b.arriveAt ? b.arriveAt.getTime() : Number.POSITIVE_INFINITY;
  if (aTime !== bTime) return aTime - bTime;
  return a.displayRoute.localeCompare(b.displayRoute, "zh-Hant");
}

function renderMetro() {
  const now = new Date();
  const options = buildMetroOptions(now);
  const best = options[0] || null;
  const config = metroSchedules[state.metroMode];

  els.metroFreshness.textContent = METRO_SOURCE_LABEL;
  els.metroLabel.textContent = config.label;
  els.metroStartLabel.textContent = state.metroMode === "toSanduo" ? "後驛站" : "三多站";
  els.metroStart.textContent = config.start;
  els.metroDirection.textContent = config.direction;
  els.metroSummary.textContent = `車程約 ${METRO_RIDE_MINUTES} 分`;

  if (!best) {
    els.metroCountdown.textContent = "--:--";
    els.metroMeta.textContent = "目前沒有可顯示的捷運班次";
    els.metroArrive.textContent = "--:--";
    els.metroCopy.textContent = "離線時刻表沒有找到下一班列車，請改查高捷 e 遊行或現場月台資訊。";
    els.metroList.innerHTML = `<p class="trip-note">目前沒有資料。</p>`;
    return;
  }

  els.metroCountdown.textContent = `${formatClock(best.arriveAt)} 抵達`;
  els.metroMeta.textContent = `${formatClock(best.departAt)} 發車，等 ${formatCountdown(best.departAt.getTime() - now.getTime())}，${best.dayText}`;
  els.metroArrive.textContent = formatClock(best.arriveAt);
  els.metroCopy.textContent = `${config.start} ${formatClock(best.departAt)} 搭 ${config.direction} 列車，約 ${formatClock(best.arriveAt)} 到 ${config.end}。`;
  renderMetroList(options, best, now);
}

function buildMetroOptions(now) {
  return [-1, 0, 1]
    .flatMap((dayOffset) => buildMetroOccurrences(now, dayOffset))
    .filter((item) => item.departAt.getTime() >= now.getTime())
    .sort((a, b) => a.departAt.getTime() - b.departAt.getTime())
    .slice(0, METRO_LOOKAHEAD_COUNT);
}

function buildMetroOccurrences(now, dayOffset) {
  const config = metroSchedules[state.metroMode];
  return config.times.map((time) => {
    const departAt = dateAtTime(now, time, dayOffset);
    const arriveAt = addMinutes(departAt, METRO_RIDE_MINUTES);
    return {
      ...config,
      time,
      dayOffset,
      departAt,
      arriveAt,
      dayText: relativeDayText(departAt, now)
    };
  });
}

function renderMetroList(options, best, now) {
  els.metroList.innerHTML = options.map((option) => {
    const isBest = option === best;
    const countdown = formatCountdown(option.departAt.getTime() - now.getTime());

    return `
      <article class="shuttle-row commute-row ${isBest ? "next" : ""}">
        <div>
          <span>${escapeHtml(option.dayText)}</span>
          <strong>${escapeHtml(option.start)}</strong>
        </div>
        <div>
          <span>${escapeHtml(option.direction)}</span>
          <strong>${escapeHtml(formatClock(option.departAt))}</strong>
        </div>
        <div>
          <span>${escapeHtml(option.end)}</span>
          <strong>${escapeHtml(formatClock(option.arriveAt))}</strong>
        </div>
        <div class="shuttle-row-countdown">${escapeHtml(countdown)}</div>
      </article>
    `;
  }).join("");
}

function relativeDayText(date, now) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfDate.getTime() - startOfToday.getTime()) / 86_400_000);
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "明天";
  return "後天";
}

function findUpcomingShuttles(now, count, timeKey = "departAt") {
  const today = buildShuttleOccurrences(now, 0);
  const tomorrow = buildShuttleOccurrences(now, 1);
  return today
    .concat(tomorrow)
    .filter((item) => item[timeKey].getTime() >= now.getTime())
    .slice(0, count);
}

function buildShuttleOccurrences(now, dayOffset) {
  return shuttleSchedule.map((item) => ({
    ...item,
    dayOffset,
    departAt: dateAtTime(now, item.depart, dayOffset),
    mrtAt: dateAtTime(now, item.mrt, dayOffset),
    arriveAt: dateAtTime(now, item.arrive, dayOffset)
  }));
}

function dateAtTime(baseDate, time, dayOffset) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + dayOffset,
    hours,
    minutes,
    0,
    0
  );
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

function minutesUntil(from, to) {
  return Math.max(0, Math.ceil((to.getTime() - from.getTime()) / 60_000));
}

function formatClock(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--:--";
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
  return `${minutes}:${pad2(seconds)}`;
}

function renderFreshness() {
  if (!state.lastUpdated) {
    els.sourceStatus.textContent = "尚未更新";
    return;
  }

  const time = new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(state.lastUpdated);
  els.sourceStatus.textContent = `更新 ${time}`;
}

function renderError(error) {
  const cached = restoreCachedSnapshot({ silent: true });
  if (cached) {
    render();
    els.sourceStatus.textContent = "使用上次資料";
    return;
  }

  els.decisionPanel.classList.remove("ready", "hold");
  els.decisionPanel.classList.add("miss");
  els.decisionLabel.textContent = "讀取失敗";
  els.decisionTitle.textContent = "先留在站內";
  els.decisionTimeSummary.textContent = "無法讀取即時公車資料";
  els.decisionCopy.textContent = error.message || "無法讀取即時公車資料。";
  els.recommendation.hidden = true;
  els.tripList.innerHTML = `<p class="trip-note">請確認網路後再更新。</p>`;
}

function scheduleRefresh() {
  clearTimeout(state.timer);
  if (!state.autoRefresh) {
    els.nextRefresh.textContent = "自動更新已關閉";
    return;
  }

  els.nextRefresh.textContent = "每 30 秒更新";
  state.timer = setTimeout(async () => {
    await refresh();
    scheduleRefresh();
  }, REFRESH_MS);
}

function toggleAutoRefresh() {
  state.autoRefresh = els.autoRefreshToggle.checked;
  persistSettings();
  scheduleRefresh();
}

function toggleSettingsPanel() {
  state.settingsOpen = !state.settingsOpen;
  els.settingsPanel.hidden = !state.settingsOpen;
  els.settingsButton.setAttribute("aria-expanded", String(state.settingsOpen));
}

function bindGestures() {
  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
  document.addEventListener("touchcancel", resetGestureState, { passive: true });
}

function handleTouchStart(event) {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  resetGestureState();
  gestureState.startX = touch.clientX;
  gestureState.startY = touch.clientY;
  gestureState.lastX = touch.clientX;
  gestureState.lastY = touch.clientY;
}

function handleTouchMove(event) {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  gestureState.lastX = touch.clientX;
  gestureState.lastY = touch.clientY;

  const deltaX = gestureState.lastX - gestureState.startX;
  const deltaY = gestureState.lastY - gestureState.startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (!gestureState.lockAxis && Math.max(absX, absY) > 8) {
    gestureState.lockAxis = absX > absY * 1.15 ? "x" : "y";
  }

  if (gestureState.lockAxis === "x") {
    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex = TABS.indexOf(state.activeTab) + direction;
    if (nextIndex >= 0 && nextIndex < TABS.length) {
      event.preventDefault();
    }
    gestureState.swiping = true;
    return;
  }

  if (state.loading || window.scrollY > 0 || deltaY <= 0 || absX > deltaY * 0.75) return;

  gestureState.pulling = true;
  gestureState.pullReady = deltaY >= 82;
  els.appShell.classList.add("pulling");
  els.appShell.style.setProperty("--pull-y", `${clamp(deltaY * 0.25, 0, 30)}px`);
  setPullRefreshState(gestureState.pullReady ? "放開更新" : "", {
    active: gestureState.pullReady
  });
}

function handleTouchEnd() {
  const deltaX = gestureState.lastX - gestureState.startX;
  const deltaY = gestureState.lastY - gestureState.startY;

  if (gestureState.pulling) {
    if (gestureState.pullReady) refresh({ manual: true });
    else setPullRefreshState("下拉更新站點");
    resetGestureState();
    return;
  }

  if (gestureState.swiping && Math.abs(deltaX) >= 72 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
    const direction = deltaX < 0 ? 1 : -1;
    resetGestureState();
    switchAdjacentTab(direction);
    return;
  }

  resetGestureState();
}

function resetGestureState() {
  gestureState.swiping = false;
  gestureState.pulling = false;
  gestureState.pullReady = false;
  gestureState.lockAxis = "";
  els.appShell.classList.remove("pulling");
  els.appShell.style.removeProperty("--pull-y");
}

function setPullRefreshState(text, options = {}) {
  const active = Boolean(options.active);
  els.pullRefresh.textContent = active ? text : "";
  els.pullRefresh.classList.toggle("active", active);
}

function switchAdjacentTab(direction) {
  const currentIndex = TABS.indexOf(state.activeTab);
  const nextTab = TABS[currentIndex + direction];
  if (!nextTab) return;
  switchTab(nextTab, { direction });
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return {
      walkMinutes: clamp(Number(saved?.walkMinutes) || 4, 2, 9),
      bufferMinutes: clamp(Number(saved?.bufferMinutes) || 1, 0, 4),
      autoRefresh: saved?.autoRefresh !== false
    };
  } catch {
    return { walkMinutes: 4, bufferMinutes: 1, autoRefresh: true };
  }
}

function persistSnapshot() {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    trips: state.trips,
    commuteTrips: state.commuteTrips,
    lastUpdated: state.lastUpdated?.toISOString()
  }));
}

function restoreCachedSnapshot(options = {}) {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (!saved?.trips?.length) return false;
    state.trips = saved.trips;
    state.commuteTrips = Array.isArray(saved.commuteTrips) ? saved.commuteTrips : [];
    state.lastUpdated = saved.lastUpdated ? new Date(saved.lastUpdated) : null;
    if (!options.silent) render();
    return true;
  } catch {
    return false;
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(console.error);
  });
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return NaN;
  return Number(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
