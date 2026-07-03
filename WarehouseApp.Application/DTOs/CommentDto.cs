
namespace WarehouseApp.Application.DTOs;

    public record CommentDto
    (
        Guid Id,
        string Content,
        DateTime CreatedAt,
        string AuthorId,
        string AuthorName
    );
