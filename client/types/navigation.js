import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import HighlightOffOutlined from "@mui/icons-material/HighlightOffOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import ApartmentIcon from '@mui/icons-material/Apartment';

export const ROLE_NAVIGATION = {
  admin: [
    { key: "overview", label: "System Dashboard", icon: DashboardOutlined },
    { key: "businesses", label: "Business Management", icon: ApartmentIcon  },
    { key: "users", label: "User Management", icon: PeopleOutline },
    { key: "products", label: "Products", icon: Inventory2Outlined },
    { key: "audit_logs", label: "Audit Logs", icon: ReceiptLongOutlined },
  ],
  business_owner: [
    { key: "overview", label: "Business Dashboard", icon: DashboardOutlined },
    { key: "users", label: "User Management", icon: PeopleOutline },
    { key: "products", label: "Products", icon: Inventory2Outlined },
  ],
  editor: [
    { key: "pending", label: "Pending", icon: FactCheckOutlined },
    { key: "confirmed", label: "Confirmed", icon: CheckCircleOutline },
    { key: "rejected", label: "Rejected", icon: HighlightOffOutlined },
  ],
  approver: [
    { key: "pending", label: "Pending", icon: FactCheckOutlined },
    { key: "confirmed", label: "Confirmed", icon: CheckCircleOutline },
  ],
};
