namespace Avaliacao.Model
{
    public class Avaliacao
    {
        public int Id { get; private set; }
        public DateTime DataAvaliacao { get; private set; }
        public int ClientId { get; private set; }
        public int Nota { get; private set; }
        public string Motivo { get; private set; }

        public Avaliacao(int id, DateTime dataAvaliacao, int clientId, int nota, string motivo)
        {
            Id = id;
            DataAvaliacao = dataAvaliacao;
            ClientId = clientId;
            Nota = nota;
            Motivo = motivo;
        }

        public void UpdateNota(int novaNota, string novoMotivo)
        {
            if (novaNota < 0 || novaNota > 10)
            {
                throw new ArgumentOutOfRangeException(nameof(novaNota), "Nota deve estar entre 0 e 10.");
            }

            Nota = novaNota;
            Motivo = novoMotivo;
        }
    }
}