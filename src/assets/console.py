import sys
from pyodide.ffi import to_js
from pyodide.console import PyodideConsole, repr_shorten, BANNER
import __main__
import builtins

pyconsole = PyodideConsole(__main__.__dict__)

async def await_fut(fut):
  res = await fut
  if res is not None:
    builtins._ = res
  return to_js([res], depth=1)

def clear_console():
  pyconsole.buffer = []