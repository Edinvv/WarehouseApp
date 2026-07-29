namespace WarehouseApp.Domain.Entities;

public class Stock
{
    public Guid Id { get; set; }
    public Guid SectorId { get; set; }
    public Sector Sector { get; set; } = null!;
    public string ProductName { get; set; } = string.Empty;
    public string Barcode { get; set; } = string.Empty;
    public int Quantity { get; set; }
}