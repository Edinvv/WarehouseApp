

namespace WarehouseApp.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Barcode { get; set; } = string.Empty;

    public Guid SectorId { get; set; }
    public Sector Sector { get; set; } = null!;
    public int Quantity { get; set; }
    public int MinimumQuantity { get; set; }
}
