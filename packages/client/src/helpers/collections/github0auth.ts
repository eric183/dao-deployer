export const login = (id: string) => {
  window.loginWindow = window.open(
    `//github.com/login/oauth/authorize?client_id=${id}&redirect_uri=http://localhost:3000/auth/github`,
    'targetWindow',
    `toolbar=no,
    location=no,
    status=no,
    menubar=no,
    scrollbars=yes,
    resizable=yes,
    width=500,
    height=500`,
  );
};
