const routes = {
  // sidebar routes
  home: "/home",
  marketplace: "/home/marketplace",
  topic: "/home/topic",
  assistant: "/home/assistant",

  // item routes
  bookDetails: (workId: string) => `/home/detail/${workId}`,

  //subject topic route
  subjectTopic: (subject: string) => `/home/topic/${subject}`,
};

export default routes;
