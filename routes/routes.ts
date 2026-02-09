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

  // auth routes
  login: "/login",
  signup: "/signup",

  // saved items
  savedItems: "/home/saved_items",

  // settings
  settings: "/home/setting",

  // marketplace
  sellItem: "/home/marketplace/sell",
  manageListings: "/home/marketplace/manage",
  itemDetail: (id: number) => `/home/marketplace/item/${id}`,
  checkout: "/checkout",
  orderHistory: "/home/marketplace/order-history",

  // messages
  messages: "/messages",

};

export default routes;
