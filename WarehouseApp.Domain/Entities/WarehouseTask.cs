
using WarehouseApp.Domain.Enums;

using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;
namespace WarehouseApp.Domain.Entities;

public class WarehouseTask
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskStatus Status { get; set; } = TaskStatus.Todo;
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public Guid SectorId { get; set; }
    public Guid? InboundOrderId { get; set; }

    public Sector Sector { get; set; } = null!;

    public string? CreatedById { get; set; }
    public AppUser CreatedBy { get; set; } = null!;
public ICollection<TaskAssignment> TaskAssignments {get;set;} = new List<TaskAssignment>();
public ICollection<TaskItem> Items { get; set; } = new List<TaskItem>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
