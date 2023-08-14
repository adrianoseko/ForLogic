using users.Model;

namespace user.Repository
{
    public interface IUserRepository
    {
        Task<IEnumerable<Users>> BuscaUsers();
        Task<Users> BuscaUser(string Login, string Senha);
        void AddUser(Users user);
        void EditUser(Users user);
        void DeleteUser(Users user);

        public Task<bool> SaveChangeAsync();

    }
}