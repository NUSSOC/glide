from pyodide.ffi import to_js
from pyodide.console import PyodideConsole, repr_shorten, BANNER
import __main__
import builtins
import sys

del sys.modules['js']

async def await_fut(fut):
  result = await fut
  if result is not None:
    builtins._ = result
  return to_js([result], depth=1)

def create_console(new_globals = __main__.__dict__):
  return PyodideConsole(new_globals)

def clear_console(console):
  if console is not None:
    console.buffer = []
