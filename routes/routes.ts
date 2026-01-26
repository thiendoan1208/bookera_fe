const routes = {
  // sidebar routes
  home: "/home",
  marketplace: "/home/marketplace",
  topic: "/home/topic",
  assistant: "/home/assistant",

  // item routes
  bookDetails: (key: string) => `/home/${key}`,

  //subject topic route
  subjectTopic: (subject: string) => `/home/topic/${subject}`,
};

export default routes;
