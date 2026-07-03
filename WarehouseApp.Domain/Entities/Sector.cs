namespace WarehouseApp.Domain.Entities;

public class Sector
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<WarehouseTask> Tasks { get; set; } = new List<WarehouseTask>();
}
