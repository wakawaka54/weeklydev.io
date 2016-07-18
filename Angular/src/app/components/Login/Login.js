class LoginController {
  constructor() {
    this.text = "This is the LOGIN COMPONENT!";
    this.test = "HELLLLO";
  }
}

export const login = {
  url: '/login',
  templateUrl: 'app/components/Login/Login.html',
  controller: LoginController
};
