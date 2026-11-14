"""Dane testowe wnętrz: dane gry (mają opinie klientów i zadowolenie załogi, których nie ma w kopii zamrożonej) + małe pliki `dane_testowe/` w `dane/wnetrza/` (teksty nie zależą
od tego, co autor pisze w prawdziwych dymkach)."""
import shutil
from pathlib import Path

import pytest
import yaml
from pomocnicze import DANE_GRY

from silnik.dane import Dane

TESTOWE = Path(__file__).parent / "dane_testowe"


@pytest.fixture(scope="session")
def kat_wnetrza(tmp_path_factory) -> Path:
    kat = tmp_path_factory.mktemp("dane_wnetrza") / "dane"
    shutil.copytree(DANE_GRY, kat, ignore=shutil.ignore_patterns("wnetrza"))
    shutil.copytree(TESTOWE, kat / "wnetrza")
    return kat


@pytest.fixture(scope="session")
def dane_w(kat_wnetrza) -> Dane:
    return Dane(kat_wnetrza)


@pytest.fixture
def pliki():
    """Świeże słowniki z plików testowych: (bywalcy, dymki, silnik) do psucia w testach walidacji."""
    return tuple(yaml.safe_load((TESTOWE / n).read_text(encoding="utf-8"))
                 for n in ("bywalcy.yaml", "dymki.yaml", "silnik.yaml"))
