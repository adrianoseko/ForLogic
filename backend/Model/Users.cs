namespace Users.Model
{
    public class User
    {
        public int Id { get; private set; }
        public string Login { get; private set; }
        public string Password { get; private set; }

        public User(int id, string login, string password)
        {
            Id = id;
            Login = login;
            Password = password;
        }

        public void UpdateLogin(string newLogin)
        {
            if (string.IsNullOrWhiteSpace(newLogin))
            {
                throw new ArgumentException("Login cannot be empty or whitespace.", nameof(newLogin));
            }
            Login = newLogin;
        }

        public void UpdatePassword(string newPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword))
            {
                throw new ArgumentException("Password cannot be empty or whitespace.", nameof(newPassword));
            }
            Password = newPassword;
        }
    }
}