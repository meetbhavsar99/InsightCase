module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.builder.io",
        pathname: "/api/v1/image/**",
      },
    ],
    dangerouslyAllowSVG: true,
  },
};
