using Microsoft.EntityFrameworkCore;
using user.Data;
using users.Model;

namespace user.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly UserContext context;

        public UserRepository(UserContext context)
        {
            this.context = context;
        }
        public void AddUser(Users user)
        {
            this.context.Add(user);
        }

        public async Task<Users> BuscaUser(string login, string senha)
        {
            return await this.context.Users.FirstOrDefaultAsync(x => x.Login == login && x.Senha == senha);
        }

        public async Task<IEnumerable<Users>> BuscaUsers()
        {
            return await this.context.Users.ToListAsync();
        }

        public void DeleteUser(Users user)
        {
            this.context.Remove(user);
        }

        public void EditUser(Users user)
        {
            this.context.Update(user);
        }

        public async Task<bool> SaveChangeAsync()
        {
            return await this.context.SaveChangesAsync() > 0;
        }

    }
}