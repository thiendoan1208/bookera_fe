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

  // search route
  searchResult: (query: string) =>
    `/home/search_result?q=${encodeURIComponent(query)}`,
};

export default routes;
