namespace WarehouseApp.Domain.Entities;

public class OutboundOrderItem
{
    public Guid Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Barcode { get; set; } = string.Empty;
    public Guid SectorId { get; set; }
    public Sector Sector { get; set; } = null!;
    public Guid OutboundOrderId { get; set; }
    public OutboundOrder OutboundOrder { get; set; } = null!;
}