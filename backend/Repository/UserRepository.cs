using Microsoft.EntityFrameworkCore;
using user.Data;
using users.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace user.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly UserContext _context;

        public UserRepository(UserContext context)
        {
            _context = context;
        }

        public async Task AddUserAsync(Users user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task<Users?> GetUserAsync(string login, string password)
        {
            return await _context.Users.FirstOrDefaultAsync(x => x.Login == login && x.Senha == password);
        }

        public async Task<IEnumerable<Users>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public void DeleteUser(Users user)
        {
            _context.Users.Remove(user);
        }

        public void UpdateUser(Users user)
        {
            _context.Users.Update(user);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}