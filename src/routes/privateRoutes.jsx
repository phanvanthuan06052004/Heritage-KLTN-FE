import { lazy } from "react"
import { Navigate } from "react-router-dom"

const AdminLayout = lazy(() => import("~/layout/AdminLayout"))
const AddHeritage = lazy(() => import("~/pages/Admin/Heritage/AddHeritage"))
const HeritageDetail = lazy(() => import("~/pages/Admin/Heritage/HeritageDetail"))
const HeritageManagement = lazy(() => import("~/pages/Admin/Heritage/HeritageManagement"))
const AddKnowledgeTest = lazy(() => import("~/pages/Admin/Knowledge/AddKnowledgeTest"))
const KnowledgeTestManagement = lazy(() => import("~/pages/Admin/Knowledge/KnowledgeTestManagement"))
const UpdateKnowledgeTest = lazy(() => import("~/pages/Admin/Knowledge/UpdateKnowledgeTest"))
const KnowledgeBase = lazy(() => import("~/pages/Admin/KnowledgeBase/KnowledgeBase"))
const UserDetail = lazy(() => import("~/pages/Admin/User/UserDetail"))
const UserManagement = lazy(() => import("~/pages/Admin/User/UserManagement"))
const GraphManagement = lazy(() => import("~/pages/Admin/Graph/GraphManagement"))

const privateRoutes = [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <Navigate to="/admin/users" replace /> },
      { path: "users", element: <UserManagement /> },
      { path: "users/:id", element: <UserDetail /> },
      { path: "heritages", element: <HeritageManagement /> },
      { path: "/admin/heritages/new", element: <AddHeritage /> },
      { path: "/admin/heritages/:id", element: <HeritageDetail /> },
      { path: "/admin/knowledge-tests", element: <KnowledgeTestManagement /> },
      { path: "/admin/knowledge-tests/new", element: <AddKnowledgeTest /> },
      { path: "/admin/knowledge-tests/:id", element: <UpdateKnowledgeTest /> },
      { path: "/admin/knowledge-tests/edit/:id", element: <UpdateKnowledgeTest /> },
      { path: "/admin/knowledge-base", element: <KnowledgeBase /> },
      { path: "/admin/graph", element: <GraphManagement /> },
    ],
  },
]

export default privateRoutes
