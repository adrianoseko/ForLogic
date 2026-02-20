using avaliacao.Data;
using avaliacao.Model;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace avaliacao.Repository
{
    public class AvaliacaoRepository : IAvaliacaoRepository
    {
        private readonly AvaliacaoContext _context;

        public AvaliacaoRepository(AvaliacaoContext context)
        {
            _context = context; // Initialize the context in the constructor
        }

        public async Task AddAvaliacaoAsync(Avaliacao avaliacao)
        {
            await _context.AddAsync(avaliacao);
        }

        public async Task<IEnumerable<Avaliacao>> GetAvaliacoesAsync()
        {
            return await _context.Avaliacao.ToListAsync();
        }

        public async Task<Avaliacao?> GetAvaliacaoByIdAsync(int id)
        {
            return await _context.Avaliacao.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task DeleteAvaliacaoAsync(Avaliacao avaliacao)
        {
            _context.Remove(avaliacao);
        }

        public async Task EditAvaliacaoAsync(Avaliacao avaliacao)
        {
            _context.Update(avaliacao);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}