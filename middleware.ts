export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/events/:path*",
        "/calendar/:path*",
        "/collaboration/:path*",
        "/profile/:path*",
    ],
};
