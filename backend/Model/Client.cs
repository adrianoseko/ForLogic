namespace Client.Model
{
    public class Client
    {
        public int Id { get; private set; }
        public string Name { get; private set; }
        public string ResponsiblePerson { get; private set; }
        public string Cnpj { get; private set; }
        public DateTime RegistrationDate { get; private set; }
        public string ClientType { get; private set; }

        public Client(int id, string name, string responsiblePerson, string cnpj, DateTime registrationDate, string clientType)
        {
            Id = id;
            Name = name;
            ResponsiblePerson = responsiblePerson;
            Cnpj = cnpj;
            RegistrationDate = registrationDate;
            ClientType = clientType;
        }

        public void UpdateClientInfo(string name, string responsiblePerson, string clientType)
        {
            Name = name;
            ResponsiblePerson = responsiblePerson;
            ClientType = clientType;
        }
    }
}