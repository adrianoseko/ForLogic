using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using client.Data;
using client.Model;

namespace client.Repository
{
    /// <summary>
    /// Repository responsible for CRUD operations on Client entities.
    /// </summary>
    public class ClientRepository : IClientRepository
    {
        private readonly ClientContext _context;
        private readonly ILogger<ClientRepository>? _logger;

        public ClientRepository(ClientContext context, ILogger<ClientRepository>? logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task AddClientAsync(Client client)
        {
            if (client == null) throw new ArgumentNullException(nameof(client));
            await _context.AddAsync(client).ConfigureAwait(false);
        }

        public async Task<Client?> GetClientByCnpjAsync(int cnpj)
        {
            return await _context.Client.FirstOrDefaultAsync(x => x.Cnpj == cnpj).ConfigureAwait(false);
        }

        public async Task<IEnumerable<Client>> GetAllClientsAsync()
        {
            return await _context.Client.ToListAsync().ConfigureAwait(false);
        }

        public void DeleteClient(Client client)
        {
            if (client == null) throw new ArgumentNullException(nameof(client));
            _context.Remove(client);
        }

        public void UpdateClient(Client client)
        {
            if (client == null) throw new ArgumentNullException(nameof(client));
            _context.Update(client);
        }

        public async Task<bool> SaveChangesAsync()
        {
            try
            {
                var changes = await _context.SaveChangesAsync().ConfigureAwait(false);
                return changes > 0;
            }
            catch (DbUpdateException ex)
            {
                _logger?.LogError(ex, "An error occurred while saving changes to the database.");
                throw;
            }
        }
    }
}
