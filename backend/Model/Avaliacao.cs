
namespace avaliacao.Model
{
    public class Avaliacao
    {
        public int Id { get; set; }
        public DateTime DataAvaliacao { get; set; }
        public int Client { get; set; }
        public int Nota { get; set; }
        public string Motivo { get; set; }
    }
}