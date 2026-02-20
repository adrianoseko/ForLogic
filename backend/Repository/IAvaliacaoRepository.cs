using System.Collections.Generic;
using System.Threading.Tasks;
using avaliacao.Model;

namespace avaliacao.Repository
{
    public interface IAvaliacaoRepository
    {
        Task<IEnumerable<Avaliacao>> GetAvaliacoesAsync();
        Task<Avaliacao> GetAvaliacaoByIdAsync(int id);
        Task AddAvaliacaoAsync(Avaliacao avaliacao);
        Task UpdateAvaliacaoAsync(Avaliacao avaliacao);
        Task DeleteAvaliacaoAsync(int id);
        Task<bool> SaveChangesAsync();
    }
}