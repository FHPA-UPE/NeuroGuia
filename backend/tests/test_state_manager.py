from app.services.state_manager import build_system_prompt


def test_system_prompt_contem_instrucoes_de_avatar_state():
    prompt = build_system_prompt()
    assert "avatar_state" in prompt
    assert "neutral" in prompt
    assert "happy" in prompt
    assert "encouraging" in prompt
    assert "empathetic" in prompt
    assert "thoughtful" in prompt


def test_system_prompt_contem_instrucoes_de_movement():
    prompt = build_system_prompt()
    assert "movement" in prompt
    assert "idle" in prompt
    assert "talking" in prompt
    assert "thinking" in prompt


def test_system_prompt_nao_vazio():
    prompt = build_system_prompt()
    assert len(prompt) > 200
