

namespace WarehouseApp.Domain.Entities;

public class TaskAssignment
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public Guid WarehouseTaskId { get; set; }
    public WarehouseTask WarehouseTask { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
