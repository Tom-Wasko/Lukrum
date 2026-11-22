from django.urls import path

from . import widoki as w

urlpatterns = [
    path("", w.start),
    path("jak-grac", w.jak_grac),
    path("radio.json", w.radio_json),
    path("nagrania-w-radiu", w.nagrania_w_radiu),
    path("gra/<str:id_>", w.wybor_firmy),
    path("gra/<str:id_>/<str:firma>", w.strona_gry),
]
