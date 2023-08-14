using Microsoft.EntityFrameworkCore;
using client.Data;
using client.Model;

namespace client.Repository
{
    public class ClientRepository : IClientRepository
    {
        private readonly ClientContext context;

        public ClientRepository(ClientContext context)
        {
            this.context = context;
        }

        public IEnumerable<object> Client { get; internal set; }

        public void AddClient(Client client)
        {
            this.context.Add(client);
        }



        public async Task<Client> BuscaClient(int cnpj)
        {
            return await this.context.Client.FirstOrDefaultAsync(x => x.Cnpj == cnpj);
        }

        public async Task<IEnumerable<Client>> BuscaClients()
        {
            return await this.context.Client.ToListAsync();
        }


        public void DeleteClient(Client client)
        {
            this.context.Remove(client);
        }


        public void EditClient(Client client)
        {
            this.context.Update(client);
        }

        public async Task<bool> SaveChangeAsync()
        {
            return await this.context.SaveChangesAsync() > 0;
        }

    }
}