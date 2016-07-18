class LoginController {
  constructor() {
    this.text = "This is the LOGIN COMPONENT!";
  }
}

const LoginComponent = {
  url: '/login',
  templateUrl: 'app/components/Login/login.html',
  controller: LoginController
};

export default LoginComponent;
