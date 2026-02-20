using System.Collections.Generic;
using System.Threading.Tasks;
using users.Model;

namespace user.Repository
{
    public interface IUserRepository
    {
        Task<IEnumerable<Users>> GetUsersAsync();
        Task<Users> GetUserAsync(string login, string password);
        Task AddUserAsync(Users user);
        Task EditUserAsync(Users user);
        Task DeleteUserAsync(Users user);
        Task<bool> SaveChangesAsync();
    }
}