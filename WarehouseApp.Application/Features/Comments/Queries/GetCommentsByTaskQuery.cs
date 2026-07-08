using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;

namespace WarehouseApp.Application.Features.Comments.Queries;

public record GetCommentsByTaskQuery(Guid TaskId) : IRequest<List<CommentDto>>;

public class GetCommentsByTaskQueryHandler : IRequestHandler<GetCommentsByTaskQuery, List<CommentDto>>
{
    private readonly IAppDbContext _context;
    public GetCommentsByTaskQueryHandler(IAppDbContext context) => _context = context;

    public async Task<List<CommentDto>> Handle(GetCommentsByTaskQuery request, CancellationToken cancellationToken)
    {
        return await _context.Comments
            .Where(c => c.TaskId == request.TaskId)
            .Include(c => c.Author)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CommentDto(
                c.Id,
                c.Content,
                c.CreatedAt,
                c.AuthorId,
                c.Author.FirstName + " " + c.Author.LastName
            ))
            .ToListAsync(cancellationToken);
    }
}