using Microsoft.EntityFrameworkCore;
using client.Data;
using client.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace client.Repository
{
    public class ClientRepository : IClientRepository
    {
        private readonly ClientContext _context;

        public ClientRepository(ClientContext context)
        {
            _context = context;
        }

        public async Task AddClientAsync(Client client)
        {
            await _context.AddAsync(client);
        }

        public async Task<Client?> GetClientByCnpjAsync(int cnpj)
        {
            return await _context.Client.FirstOrDefaultAsync(x => x.Cnpj == cnpj);
        }

        public async Task<IEnumerable<Client>> GetAllClientsAsync()
        {
            return await _context.Client.ToListAsync();
        }

        public void DeleteClient(Client client)
        {
            _context.Remove(client);
        }

        public void UpdateClient(Client client)
        {
            _context.Update(client);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}