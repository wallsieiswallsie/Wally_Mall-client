const paths = {
  search: "m21 21-5-5 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  home: "m3 10 9-7 9 7v11h-6v-7H9v7H3Z",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  user: "M20 21v-2a7 7 0 0 0-14 0v2 M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  grid: "M3 3h7v7H3Z M14 3h7v7h-7Z M3 14h7v7H3Z M14 14h7v7h-7Z",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z",
  shirt: "m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 4-8 4-8 0Z",
  cup: "M4 7h13v9a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z M17 8h2a3 3 0 0 1 0 6h-2 M7 2v2m4-2v2m4-2v2",
  phone:
    "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z M10 18h4",
  sparkle: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z",
  game: "M7 7h10c4 0 7 13 3 13l-4-4H8l-4 4C0 20 3 7 7 7Z M7 10v5m-2-2h4m6-2h.1m3 3h.1",
  car: "m5 4-3 9v7h3v-3h14v3h3v-7l-3-9Z M2 12h20 M6 14v1m12-1v1",
  tool: "M14 3a6 6 0 0 0-7 8L2 17l5 5 6-6a6 6 0 0 0 8-7l-4 4-5-5Z",
  smile:
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M8 9h.1m8 0h.1M7 14c2 5 8 5 10 0",
  ball: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M2 12h20 M12 2c-7 5-7 15 0 20 7-5 7-15 0-20",
  close: "m6 6 12 12M6 18 18 6",
  filter: "M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-8 0v6",
  check: "m5 12 4 4L19 6",
  store:
    "M3 10v11h18V10 M2 3h20v7c-2 3-4 3-5 0-2 3-4 3-5 0-2 3-4 3-5 0-1 3-3 3-5 0Z M9 21v-7h6v7",
  share: "M12 16V2m-5 5 5-5 5 5M5 11H3v11h18V11h-2",
  plus: "M12 4v16M4 12h16",
  image: "M3 3h18v18H3Z m0 14 5-5 4 4 4-6 5 7 M9 7h.1",
  eye: "M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  chat: "M21 3H3v14h5l4 5 4-5h5Z M7 8h10M7 12h6",
  back: "M20 12H4m6-6-6 6 6 6",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2",
  chevron: "m9 5 7 7-7 7",
};
export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
