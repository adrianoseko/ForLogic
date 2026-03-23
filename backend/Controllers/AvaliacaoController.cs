using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using avaliacao.Model;
using avaliacao.Repository;

namespace avaliacao.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // Require authentication for all endpoints in this controller.
    // Role-based authorization is applied on individual endpoints so you can