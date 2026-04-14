import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/root-layout";
import { AdminLayout } from "./layouts/admin-layout";
import { HomePage } from "./pages/home-page";
import { ExplorePage } from "./pages/explore-page";
import { ProductDetailPage } from "./pages/product-detail-page";
import { CartPage } from "./pages/cart-page";
import { CheckoutPage } from "./pages/checkout-page";
import { ProfilePage } from "./pages/profile-page";
import { OrdersPage } from "./pages/orders-page";
import { WishlistPage } from "./pages/wishlist-page";
import { BlogListPage } from "./pages/blog-list-page";
import { BlogDetailPage } from "./pages/blog-detail-page";
import { ServicesPage } from "./pages/services-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { VerifyEmailPage } from "./pages/verify-email-page";
import { ForgotPasswordPage } from "./pages/forgot-password-page";
import { AboutPage } from "./pages/about-page";
import { ContactPage } from "./pages/contact-page";
import { TermsPage } from "./pages/terms-page";
import { PrivacyPage } from "./pages/privacy-page";
import { AdminDashboard } from "./pages/admin/dashboard";
import { AdminProducts } from "./pages/admin/products";
import { AdminProductForm } from "./pages/admin/product-form";
import { AdminCategories } from "./pages/admin/categories";
import { AdminUsers } from "./pages/admin/users";
import { AdminOrders } from "./pages/admin/orders";
import { AdminBlogs } from "./pages/admin/blogs";
import { AdminAds } from "./pages/admin/ads";
import { AdminServices } from "./pages/admin/services";
import { AdminContactInquiries } from "./pages/admin/contact-inquiries";
import { AdminSiteConfig } from "./pages/admin/site-config";
import { NotFoundPage } from "./pages/not-found-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "explore/products", Component: ExplorePage },
      { path: "product/:id", Component: ProductDetailPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "profile", Component: ProfilePage },
      { path: "wishlist", Component: WishlistPage },
      { path: "orders", Component: OrdersPage },
      { path: "blog", Component: BlogListPage },
      { path: "blog/:id", Component: BlogDetailPage },
      { path: "services", Component: ServicesPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "verify-email", Component: VerifyEmailPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "terms", Component: TermsPage },
      { path: "privacy", Component: PrivacyPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "products/new", Component: AdminProductForm },
      { path: "products/edit/:id", Component: AdminProductForm },
      { path: "categories", Component: AdminCategories },
      { path: "users", Component: AdminUsers },
      { path: "orders", Component: AdminOrders },
      { path: "blogs", Component: AdminBlogs },
      { path: "ads", Component: AdminAds },
      { path: "services", Component: AdminServices },
      { path: "inquiries", Component: AdminContactInquiries },
      { path: "settings", Component: AdminSiteConfig },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
