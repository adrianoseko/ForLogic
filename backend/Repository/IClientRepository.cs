using client.Model;

namespace client.Repository
{
    public interface IClientRepository
    {
        Task<IEnumerable<Client>> GetClientsAsync();
        Task<Client?> GetClientByCnpjAsync(int cnpj);
        Task AddClientAsync(Client client);
        Task UpdateClientAsync(Client client);
        Task DeleteClientAsync(Client client);

        Task<bool> SaveChangesAsync();
    }
}