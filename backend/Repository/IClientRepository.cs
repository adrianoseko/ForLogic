using client.Model;

namespace client.Repository
{
    public interface IClientRepository
    {
        Task<IEnumerable<Client>> BuscaClients();
        Task<Client> BuscaClient(int cnpj);
        void AddClient(Client client);
        void EditClient(Client client);
        void DeleteClient(Client client);

        public Task<bool> SaveChangeAsync();
    }
}