

namespace WarehouseApp.Domain.Entities;

public class Comment
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string AuthorId { get; set; } = string.Empty;
    public AppUser Author { get; set; } = null!;
    public Guid TaskId { get; set; }
    public WarehouseTask Task { get; set; } = null!;
}
