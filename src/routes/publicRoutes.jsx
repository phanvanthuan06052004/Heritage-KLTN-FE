const publicRoutes = [
  { path: "/", element: null },
  { path: "/about", element: null },
  { path: "/heritages", element: null },
  { path: "/heritage/:nameSlug", element: null },
  { path: "/login", element: null, restricted: true },
  { path: "/register", element: null, restricted: true },
  { path: "/authen-confirm", element: null, restricted: true },
  { path: "/chat/heritage/:nameSlug", element: null },
  { path: "/profile", element: null },
  { path: "/favorites", element: null },
  { path: "/explore", element: null },
  { path: "/forgot-password", element: null, restricted: true },
  { path: "/battle-timeline", element: null },
];

export default publicRoutes;
