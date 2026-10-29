const KST = "Asia/Seoul";

export function formatCount(n: number) {
  return n.toLocaleString("ko-KR");
}

/** 한국 시각 기준 "10월 29일 11:00" */
export function formatDateTime(iso: string) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  return parts;
}

/** 한국 시각 기준 "10월 29일 (목)" */
export function formatDay(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    month: "long",
    day: "numeric",
    weekday: "short",
  })
    .format(new Date(iso))
    .replace(/ ([가-힣])$/, " ($1)");
}

/** 한국 시각 기준 "10/29" */
export function formatShortDate(iso: string) {
  const [, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: KST }).format(new Date(iso)).split("-");
  return `${Number(m)}/${Number(d)}`;
}
