using MediatR;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Application.Features.Sectors.Commands;

    public record CreateSectorCommand(string Name, string? Description) : IRequest<Guid>;
    public class CreateSectorCommandHandler : IRequestHandler<CreateSectorCommand, Guid>
    {
        private readonly IAppDbContext _context;
        public CreateSectorCommandHandler(IAppDbContext context)
        {
            _context = context;
        }
        public async Task<Guid> Handle(CreateSectorCommand request, CancellationToken cancellationToken)
        {
            var sector = new Sector
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description
            };
            _context.Sectors.Add(sector);
            await _context.SaveChangesAsync(cancellationToken);
            return sector.Id;
        }
    }

