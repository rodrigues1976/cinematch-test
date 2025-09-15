*** Settings ***
Documentation     CineMatch Smoke Tests - Robot Framework
Library           RequestsLibrary
Library           Collections
Library           String
Suite Setup       Create Session    cinematch    http://localhost:3000
Suite Teardown    Delete All Sessions

*** Variables ***
${BASE_URL}       http://localhost:3000
${TEST_USER_ID}   test-user-123
${VALID_MOVIE_ID}    1
${VALID_RATING}      4

*** Test Cases ***
Health Check API Should Return Success
    [Documentation]    Verifica se a API de health check está funcionando
    [Tags]    smoke    health
    ${response}=    GET On Session    cinematch    /api/health
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['status']}    healthy
    Should Contain    ${json}    timestamp

Get Movies Should Return Movie List
    [Documentation]    Verifica se a API de filmes retorna lista de filmes
    [Tags]    smoke    movies
    ${response}=    GET On Session    cinematch    /api/movies
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}
    Should Contain    ${json}    data
    Should Contain    ${json}    total
    ${movies}=    Set Variable    ${json['data']}
    Should Not Be Empty    ${movies}
    
    # Verificar estrutura do primeiro filme
    ${first_movie}=    Set Variable    ${movies[0]}
    Should Contain    ${first_movie}    id
    Should Contain    ${first_movie}    title
    Should Contain    ${first_movie}    genres
    Should Contain    ${first_movie}    year
    Should Contain    ${first_movie}    globalRating

Get Movies With Genre Filter Should Work
    [Documentation]    Verifica se o filtro por gênero funciona
    [Tags]    smoke    movies    filter
    ${response}=    GET On Session    cinematch    /api/movies    params=genre=Ação
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}
    ${movies}=    Set Variable    ${json['data']}
    
    # Verificar se todos os filmes contêm o gênero Ação
    FOR    ${movie}    IN    @{movies}
        Should Contain    ${movie['genres']}    Ação
    END

Get Specific Movie Should Return Movie Details
    [Documentation]    Verifica se é possível obter detalhes de um filme específico
    [Tags]    smoke    movies
    ${response}=    GET On Session    cinematch    /api/movies/${VALID_MOVIE_ID}
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}
    Should Contain    ${json}    data
    ${movie}=    Set Variable    ${json['data']}
    Should Be Equal As Integers    ${movie['id']}    ${VALID_MOVIE_ID}

Post User Rating Should Create Rating
    [Documentation]    Verifica se é possível criar uma avaliação de usuário
    [Tags]    smoke    ratings
    ${rating_data}=    Create Dictionary    movieId=${VALID_MOVIE_ID}    rating=${VALID_RATING}
    ${response}=    POST On Session    cinematch    /api/users/${TEST_USER_ID}/ratings    json=${rating_data}
    Should Be Equal As Integers    ${response.status_code}    201
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}
    Should Contain    ${json}    data
    ${rating}=    Set Variable    ${json['data']}
    Should Be Equal    ${rating['userId']}    ${TEST_USER_ID}
    Should Be Equal As Integers    ${rating['movieId']}    ${VALID_MOVIE_ID}
    Should Be Equal As Integers    ${rating['rating']}    ${VALID_RATING}

Get User Ratings Should Return Ratings Map
    [Documentation]    Verifica se é possível obter as avaliações de um usuário
    [Tags]    smoke    ratings
    ${response}=    GET On Session    cinematch    /api/users/${TEST_USER_ID}/ratings
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}
    Should Contain    ${json}    data

Post Invalid Rating Should Return Error
    [Documentation]    Verifica se avaliações inválidas são rejeitadas
    [Tags]    smoke    ratings    validation
    ${invalid_rating_data}=    Create Dictionary    movieId=${VALID_MOVIE_ID}    rating=6
    ${response}=    POST On Session    cinematch    /api/users/${TEST_USER_ID}/ratings    json=${invalid_rating_data}    expected_status=400
    Should Be Equal As Integers    ${response.status_code}    400
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${False}
    Should Contain    ${json['error']}    Rating must be between 1 and 5

Delete User Rating Should Remove Rating
    [Documentation]    Verifica se é possível remover uma avaliação
    [Tags]    smoke    ratings
    ${response}=    DELETE On Session    cinematch    /api/users/${TEST_USER_ID}/ratings/${VALID_MOVIE_ID}
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}

Create Multiple Ratings For Recommendations Test
    [Documentation]    Cria 5 avaliações para testar o sistema de recomendações
    [Tags]    smoke    setup
    ${movies_to_rate}=    Create List    1    2    3    4    5
    ${ratings}=    Create List    5    4    3    2    1
    
    FOR    ${i}    IN RANGE    5
        ${movie_id}=    Get From List    ${movies_to_rate}    ${i}
        ${rating}=    Get From List    ${ratings}    ${i}
        ${rating_data}=    Create Dictionary    movieId=${movie_id}    rating=${rating}
        ${response}=    POST On Session    cinematch    /api/users/${TEST_USER_ID}/ratings    json=${rating_data}
        Should Be Equal As Integers    ${response.status_code}    201
    END

Get Recommendations Should Return 5 Movies
    [Documentation]    Verifica se o sistema de recomendações retorna exatamente 5 filmes
    [Tags]    smoke    recommendations
    [Setup]    Create Multiple Ratings For Recommendations Test
    
    ${response}=    GET On Session    cinematch    /api/users/${TEST_USER_ID}/recommendations
    Should Be Equal As Integers    ${response.status_code}    200
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${True}
    Should Contain    ${json}    data
    
    ${data}=    Set Variable    ${json['data']}
    Should Contain    ${data}    recommendations
    Should Contain    ${data}    genreClassification
    Should Contain    ${data}    genreScores
    Should Contain    ${data}    totalRatings
    
    ${recommendations}=    Set Variable    ${data['recommendations']}
    ${rec_count}=    Get Length    ${recommendations}
    Should Be Equal As Integers    ${rec_count}    5
    
    # Verificar estrutura das recomendações
    FOR    ${rec}    IN    @{recommendations}
        Should Contain    ${rec}    movie
        Should Contain    ${rec}    finalScore
        Should Contain    ${rec}    genreScore
        Should Contain    ${rec}    globalRating
    END

Get Recommendations Without Enough Ratings Should Fail
    [Documentation]    Verifica se o sistema rejeita usuários com menos de 5 avaliações
    [Tags]    smoke    recommendations    validation
    ${new_user_id}=    Set Variable    new-user-no-ratings
    ${response}=    GET On Session    cinematch    /api/users/${new_user_id}/recommendations    expected_status=400
    Should Be Equal As Integers    ${response.status_code}    400
    ${json}=    Set Variable    ${response.json()}
    Should Be Equal    ${json['success']}    ${False}
    Should Contain    ${json['error']}    Minimum 5 ratings required

*** Keywords ***
Create Multiple Ratings For Recommendations Test
    [Documentation]    Helper keyword para criar avaliações de teste
    ${movies_to_rate}=    Create List    1    2    3    4    5
    ${ratings}=    Create List    5    4    3    2    1
    
    FOR    ${i}    IN RANGE    5
        ${movie_id}=    Get From List    ${movies_to_rate}    ${i}
        ${rating}=    Get From List    ${ratings}    ${i}
        ${rating_data}=    Create Dictionary    movieId=${movie_id}    rating=${rating}
        POST On Session    cinematch    /api/users/${TEST_USER_ID}/ratings    json=${rating_data}
    END
